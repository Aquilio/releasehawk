/**
 * This job is meant to run via an AMQP queue and should be run after a new
 * installation is confirmed (setup PR is merged).
 * It parses the .releasehawk.yml file and creates a watch for each release repo
 */
const parseGitHubUrl = require('parse-github-url');
const { createJobError } = require('./utils/job-error');
const getRepo = require('./utils/get-repo');
const getConfig = require('./utils/get-config');

async function _finalize(app, {installationId, repository}) {
  const reposService = app.service('repos');
  const watchesService = app.service('watches');
  const github = app.get('github');

  const {
    id: repoId,
    full_name: fullName
  } = repository;
  const [owner, repo] = repository.full_name.split('/');
  const logPrefix = `${fullName} (${repoId})`;
  let repoEntry;

  console.log(`${logPrefix} Starting finalize job`);

  // Get current status of the watch. Normally this would return no results
  const repoResult = await reposService.find({
    query: {
      installationId: installationId,
      githubId: repoId
    }
  }).catch(e => {
    throw createJobError(`${logPrefix} Error getting repo`, e);
  });

  // If there is a result, check if a setup PR or issue was already created
  if(repoResult.total > 0) {
    repoEntry = repoResult.data[0];
  }

  // Get config
  console.log(`${logPrefix} Getting config`);
  const config = await getConfig({
    github, installationId, owner, repo
  }).catch(e => {
    throw createJobError(`${logPrefix} Error getting config`, e);
  });

  // Ensure each target exists
  await Promise.all(Object.keys(config).map(async (target) => {
    console.log(`${logPrefix} Parsing settings for '${target}'`);
    const settings = config[target];
    let targetName;
    if(settings.type !== 'file') {
      const { owner, name } = parseGitHubUrl(target);
      targetName = `${owner}/${name}`;
      try {
        await getRepo({
          github, owner, repo: name
        });
      } catch (e) {
        debugger
        // Could not get the repo
        // TOTO: Create an issue
        return Promise.resolve();
      }
    } else {
      // TODO: validate existance of file
      targetName = target;
    }
    console.log(`${logPrefix} Creating a watch for '${target}'`);
    return watchesService.create({
      repoId: repoEntry.id,
      target: targetName,
      type: settings.type || 'release'
    });
  }));
  console.log(`${logPrefix} Activating repo ${repoEntry.id}`);
  return reposService.patch(repoEntry.id, {
    active: true,
    setupId: null,
    issueId: null
  });
}

module.exports = function finalize(app, options) {
  // const basePath = path.join(process.cwd(), app.get('workPath'), uuidv4());
  // options.basePath = basePath;
  return _finalize(app, options).catch(e => {
    // fse.removeSync(basePath);
    throw e;
  });
};
