/**
 * This job is meant to run on a fixed interval.
 * It checks the release repo of all watches that haven't been checked in a
 * configured period. If a new release is present, a `release` job is spawned.
 */
const parseGitHubUrl = require('parse-github-url');
const isAfter = require('date-fns/is_after');
const app = require('../src/app');

const { createJobError } = require('./utils/job-error');
const getConfig = require('./utils/get-config');
const getLatestRelease = require('./utils/get-latest-release');
const getLatestTag = require('./utils/get-latest-tag');
const getLatestCommit = require('./utils/get-latest-commit');
const getCommit = require('./utils/get-commit');

// setup has to be called so services run their setup funtions
app.setup();

const github = app.get('github');
const watchesService = app.service('watches');
const releaseQueueService = app.service('release-queue');
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
  github, installationId, target, type, settings
}) {
  const { owner, name } = parseGitHubUrl(target);
  let update;
  let checksum;
  let date;
  let re = null;
  let tagCommit;
  switch(type) {
  case 'commit':
    if(settings.commit_re) {
      re = new RegExp(settings.commit_re, 'ig');
    }
    update = await getLatestCommit({github, owner, repo: name, re}).catch(e => {
      throw createJobError(`[${owner}/${name} (${target})] Error getting latest commit`, e);
    });
    checksum = update.sha;
    date = update.commit.committer.date;
    console.log(`[${owner}/${name} (${target})] Latest update is commit ${checksum} from ${date}`);
    break;
  case 'tag':
    update = await getLatestTag({github, installationId, owner, repo: name}).catch(e => {
      throw createJobError(`[${owner}/${name} (${target})] Error getting latest tag`, e);
    });
    checksum = update.commit.sha;
    tagCommit = await getCommit({github, installationId, owner, repo: name, sha: checksum}).catch(e => {
      throw createJobError(`[${owner}/${name} (${target})] Error getting tag commit information`, e);
    });
    date = tagCommit.commit.committer.date;
    console.log(`[${owner}/${name} (${target})] Latest update is tag ${update.name}(${checksum}) from ${date}`);
    break;
  case 'release':
  default:
    update = await getLatestRelease({github, installationId, owner, repo: name}).catch(e => {
      throw createJobError(`[${owner}/${name} (${target})] Error getting latest release`, e);
    });
    checksum = update.tag_name;
    date = update.published_at;
    console.log(`[${owner}/${name} (${target})] Latest update is release ${checksum} from ${date}`);
    break;
  }
  return {
    update,
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
  const isNewer = isAfter(change.date, watch.lastUpdatedAt);
  const isDifferent = updateWatch.checksum !== watch.lastUpdate;

  if(isDifferentType) {
    await updateWatch(watch, {
      type: settings.type
    });
  }

  if(isDifferentType || (isNewer && isDifferent)) {
    console.log(`[${owner}/${name} (${watch.target})] Scheduling release job for latest release from ${watch.target}`);
    promise = scheduleReleaseJob(watch, change);
  } else {
    console.log(`[${owner}/${name} (${watch.target})] Latest is up to date`);
  }
  return promise;
}

/**
 * Schedule a release job to process a new release
 *
 * @param {*} watch the watch being checked
 * @param {*} release the latest release
 * @return {Promise}
 */
function scheduleReleaseJob(watch, release) {
  return releaseQueueService.create({
    watch, release
  });
}

/**
 * Check if a watch has the latest release
 *
 * @param {*} watch the watch being processed
 * @return {Promise<Array>}
 */
async function checkWatch(watch) {
  const { target, lastUpdatedAt, lastUpdate, type } = watch;
  const { installationId, owner, repo, githubId: repoId } = watch.repo;

  // Get config
  const config = await getConfig({
    github, installationId, owner, repo
  }).catch(e => {
    throw createJobError(`[${owner}/${repo} (${target})] Error getting config`, e);
    // TODO: Create issue
  });

  const settings = config[target];
  if(!settings) {
    throw createJobError(`[${owner}/${repo} (${target})] Settings not found in config, removing...`);
    //TODO: Remove this watch
  }

  // Get latest update
  const change = await getLatestChange({
    github, installationId, target, type, settings
  }).catch(e => {
    throw createJobError(`[${owner}/${repo} (${target})] Error getting latest change`, e);
    // TODO: Create issue
  });

  await processChange({
    watch, change, settings
  }).catch(e => {
    throw createJobError(`[${owner}/${repo} (${target})] Error processing latest change`, e);
    // TODO: Create issue
  });

  await updateWatch(watch, {
    lastCheckedAt: new Date().getTime(),
    lastUpdate: change.checksum,
    lastUpdatedAt: change.date
  }).catch(e => {
    throw createJobError(`[${owner}/${repo} (${target})] Error updating watch`, e);
  });
  return Promise.resolve(change);
}

async function check() {
  console.log('Starting check script');
  const watchesToCheck = await findWatchesToCheck().catch(e => {
    throw createJobError('Error finding watches to check', e);
  });
  console.log(`${watchesToCheck.length} watches to check`);
  return Promise.all(watchesToCheck.map(watch => {
    let promise = Promise.resolve();
    try {
      promise = checkWatch(watch);
    } catch(e) {
      console.error(e);
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
