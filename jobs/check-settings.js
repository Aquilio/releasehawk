/**
 * This job is meant to run on a fixed interval.
 * It checks the config for each repo and adds any new watches in the config.
 */
const parseGitHubUrl = require('parse-github-url');
const app = require('../src/app');

const { createJobError } = require('./utils/job-error');
const getConfig = require('./utils/get-config');

// setup has to be called so services run their setup funtions
app.setup();

const github = app.get('github');
const reposService = app.service('repos');
const watchesService = app.service('watches');

/**
 * Getall repos
 *
 * @return {Promise<Array>} repos to be checked
 */
function findReposToCheck() {
  return reposService.find({
    query: {
      $limit: -1,
      active: true
    },
  });
}

/**
 * Check if a watch has the latest release
 *
 * @param {*} watch the watch being processed
 * @return {Promise<Array>}
 */
async function checkRepo(respository) {
  const { installationId, owner, repo, githubId: repoId } = respository;
  const logPrefix = `[${owner}/${repo}]`;

  // Get config
  const config = await getConfig({
    github, installationId, owner, repo
  }).catch(e => {
    throw createJobError(`${logPrefix} Error getting config`, e);
  });

  const newTargets = Object.keys(config).filter(target => {
    return !respository.watches.find(watch => watch.target === target);
  });
  console.log(`${logPrefix} Found ${newTargets.length} new targets`);

  if(newTargets.length === 0) {
    return Promise.resolve();
  }
  return Promise.all(newTargets.map(async (newTarget) => {
    const settings = config[newTarget];
    console.log(`${logPrefix} Adding watch for ${newTarget}`);
    return watchesService.create({
      repoId: respository.id,
      target: newTarget,
      type: settings.type || 'release',
      active: true
    });
  }));
}

async function check() {
  console.log('Starting check-settings script');
  const reposToCheck = await findReposToCheck().catch(e => {
    throw createJobError('Error finding repos to check', e);
  });
  console.log(`${reposToCheck.length} repos to check`);
  return Promise.all(reposToCheck.map(respository => {
    let promise = Promise.resolve();
    try {
      promise = checkRepo(respository);
    } catch(e) {
      console.error(e);
    }
    return promise;
  }));
}

check().then(() => {
  process.exit(0);
}).catch((e) => {
  console.error('ERROR running check-settings process', e);
  process.exit(e.code || 1);
});
