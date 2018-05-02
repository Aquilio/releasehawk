/**
 * This job is meant to run on a fixed interval.
 * It checks the release repo of all watches that haven't been checked in a
 * configured period. If a new release is present, a `release` job is spawned.
 */
const parseGitHubUrl = require('parse-github-url');
const app = require('../src/app');

const crypto = require('crypto');
const path = require('path');
const uuidv4 = require('uuid/v4');
const fse = require('fs-extra');
const { createJobError } = require('./utils/job-error');
const getConfig = require('./utils/get-config');
const getLatestRelease = require('./utils/get-latest-release');
const getLatestTag = require('./utils/get-latest-tag');
const getLatestCommit = require('./utils/get-latest-commit');
const getCommit = require('./utils/get-commit');
const downloadFile = require('./utils/download-file');

// setup has to be called so services run their setup funtions
app.setup();

const github = app.get('github');
const watchesService = app.service('watches');
const updateQueueService = app.service('update-queue');
const CHECK_INTERVAL = app.get('checkInterval');

/**
 * Get the watches that:
 * 1) Have not been checked
 * 2) Have not been checked in the last `checkInterval` ms
 *
 * @return {Promise<Array>} watches to be checked
 */
function findWatchesToCheck() {
  return watchesService.find({
    query: {
      $or: [
        {
          lastCheckedAt: {
            $lt: new Date(new Date().getTime() - CHECK_INTERVAL)
          }
        },
        {
          lastCheckedAt: null
        }
      ],
      $limit: -1,
      active: true,
      expand: 'repo'
    },
  });
}

/**
 * Update a watch using patch
 *
 * @param {Object} watch watch to be updated
 * @param {Object} update updates to be applied
 */
function updateWatch(watch, update) {
  return watchesService.patch(watch.id, update);
}

/**
 * Get the latest update from the release target.
 *
 * @return {Object} the latest update
 */
async function getLatestChange({
  github, installationId, target, type, settings, workingPath
}) {
  const { owner, name } = parseGitHubUrl(target);
  const logPrefix = `[${target}]`;
  let payload;
  let checksum;
  let date;
  let re = null;
  let tagCommit;
  switch(type) {
  case 'commit':
    if(settings.commit_re) {
      re = new RegExp(settings.commit_re, 'ig');
    }
    payload = await getLatestCommit({github, owner, repo: name, re}).catch(e => {
      throw createJobError(`${logPrefix} Error getting latest commit`, e);
    });
    checksum = payload.sha.slice(0, 7);
    date = payload.commit.committer.date;
    console.log(`${logPrefix} Latest update is commit ${checksum} from ${date}`);
    break;
  case 'tag':
    payload = await getLatestTag({github, installationId, owner, repo: name}).catch(e => {
      throw createJobError(`${logPrefix} Error getting latest tag`, e);
    });
    checksum = payload.name;
    tagCommit = await getCommit({github, installationId, owner, repo: name, sha: checksum}).catch(e => {
      throw createJobError(`${logPrefix} Error getting tag commit information`, e);
    });
    date = tagCommit.commit.committer.date;
    console.log(`${logPrefix} Latest update is tag ${payload.name}(${checksum}) from ${date}`);
    break;
  case 'file':
    payload = await downloadFile({url: target, dest: workingPath}).catch(e => {
      throw createJobError(`${logPrefix} Error getting latest file`, e);
    });
    checksum = crypto.createHash('md5').update(payload).digest('hex'); //MD5 hash of content
    date = new Date();
    console.log(`${logPrefix} Latest update for file is ${checksum}`);
    break;
  case 'release':
  default:
    payload = await getLatestRelease({github, installationId, owner, repo: name}).catch(e => {
      throw createJobError(`${logPrefix} Error getting latest release`, e);
    });
    checksum = payload.tag_name;
    date = payload.published_at;
    console.log(`${logPrefix} Latest update is release ${checksum} from ${date}`);
    break;
  }
  return {
    payload,
    checksum,
    date,
    type
  };
}

async function processChange({
  watch, change, settings
}) {
  let promise = Promise.resolve();
  const { owner, name } = parseGitHubUrl(watch.target);

  const isDifferentType = settings.type !== watch.type;
  // const isNewer = isAfter(change.date, watch.lastUpdatedAt);
  const isDifferent = change.checksum !== watch.lastUpdate;

  if(isDifferentType) {
    await updateWatch(watch, {
      type: settings.type
    });
  }

  if(isDifferentType || isDifferent) {
    return true;
  }
  return false;
}

/**
 * Schedule a release job to process a new release
 *
 * @param {Object} data
 * @return {Promise}
 */
function scheduleUpdateJob(data) {
  return updateQueueService.create(data);
}

/**
 * Check if a watch has the latest release
 *
 * @param {*} watch the watch being processed
 * @return {Promise<Array>}
 */
async function checkWatch(watch, basePath) {
  const { target, lastUpdatedAt, lastUpdate, type } = watch;
  const { installationId, owner, repo, githubId: repoId } = watch.repo;
  const logPrefix = `[${owner}/${repo} (${target})]`;

  // Get config
  const config = await getConfig({
    github, installationId, owner, repo
  }).catch(e => {
    throw createJobError(`${logPrefix} Error getting config`, e);
    // TODO: Create issue
  });

  const settings = config[target];
  if(!settings) {
    await watchesService.remove(watch.id).catch(e => {
      throw createJobError(`${logPrefix} Error removing watch after it was not found in config`, e);
    });
    console.log(`${logPrefix} Watch not found in config so it was removed.`);
  }

  // Get latest update
  const change = await getLatestChange({
    github, installationId, target, type, settings, workingPath: basePath
  }).catch(e => {
    throw createJobError(`${logPrefix} Error getting latest change`, e);
    // TODO: Create issue
  });

  const shouldRelease = await processChange({
    watch, change, settings
  }).catch(e => {
    throw createJobError(`${logPrefix} Error processing latest change`, e);
    // TODO: Create issue
  });

  if(shouldRelease) {
    console.log(`${logPrefix} Scheduling update job for latest change from ${target}`);
    await scheduleUpdateJob({
      watch, settings, installationId, change
    });
  } else {
    console.log(`${logPrefix} Latest is up to date`);
  }

  await updateWatch(watch, {
    lastCheckedAt: new Date().getTime(),
    // lastUpdate: change.checksum, Only update in the actual release job
    lastUpdatedAt: change.date
  }).catch(e => {
    throw createJobError(`${logPrefix} Error updating watch`, e);
  });
  return Promise.resolve(change);
}

async function check() {
  console.log('Starting check script');
  const basePath = path.join(process.cwd(), app.get('workPath'), uuidv4());
  const watchesToCheck = await findWatchesToCheck().catch(e => {
    throw createJobError('Error finding watches to check', e);
  });
  console.log(`${watchesToCheck.length} watches to check`);
  return Promise.all(watchesToCheck.map(watch => {
    let promise = Promise.resolve();
    try {
      promise = checkWatch(watch, basePath);
    } catch(e) {
      fse.removeSync(basePath);
      promise = Promise.reject(e);
    }
    return promise;
  }));
}

check().then(() => {
  process.exit(0);
}).catch((e) => {
  console.error('ERROR running check process', e);
  process.exit(e.code || 1);
});
