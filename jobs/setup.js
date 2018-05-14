/**
 * This job is meant to run via an AMQP queue and should be run after a new
 * installation occurs.
 * It creates a .releasehawk.yml file in a branch and creates a setup PR with
 * further instructions.
 */
const path = require('path');
const uuidv4 = require('uuid/v4');
const fse = require('fs-extra');
const { createJobError } = require('./utils/job-error');
const getRepo = require('./utils/get-repo');
const cloneRepo = require('./utils/clone-repo');
const createBranch = require('./utils/create-branch');
const writeFile = require('./utils/write-file');
const getStarterConfig = require('./utils/get-starter-config');
const createCommit = require('./utils/create-commit');
const pushBranch = require('./utils/push-branch');
const createPullRequest = require('./utils/create-pull-request');
const createIssue = require('./utils/create-issue');
const createLabel = require('./utils/create-label');
const addLabel = require('./utils/add-label');
const getFile = require('./utils/get-file');
const getIssue = require('./utils/get-issue');
const updateOrCreateRepo = require('./utils/update-create-repo');
const getInitialPRContent = require('../content/initial-pr');
const getConfigExistsPRContent = require('../content/config-exists');

/**
 * Get the fatal message from a git command error.
 *
 * @param {Error} error
 * @return {string}
 */
function getFatalMessage(error) {
  return error.message.substring(error.message.indexOf('fatal: ')+7).trim();
}

async function _setup(app, {installationId, repository, basePath}) {
  const reposService = app.service('repos');
  const finalizeQueue = app.service('finalize-queue');
  const github = app.get('github');
  const branchPrefix = app.get('branchPrefix');
  const configFileName = `.${app.get('configFileName')}`;
  const labelName = app.get('label').name;
  const labelColor = app.get('label').color;

  console.log(`${repository.full_name} (${repository.id}) Starting setup job`);

  // Get repo
  console.log(`${repository.full_name} (${repository.id}) Getting repository info`);
  repository = await getRepo({
    github, installationId, repoId: repository.id,
  }).catch(e => {
    throw createJobError(`${repository.full_name} (${repository.id}) Error fetching repository`, e);
  });

  const {
    id: repoId,
    default_branch: defaultBranch,
    full_name: fullName
  } = repository;
  const [owner, repo] = repository.full_name.split('/');
  const workingPath = path.join(basePath, owner, repo);
  const branchName = `${branchPrefix}/initial`;
  const logPrefix = `${fullName} (${repoId})`;
  let repoEntry;

  // Get current status of the repo.
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
    // Setup PR has been created, so we don't do anything
    // When the PR is merged, the repo will be marked active
    if(repoEntry.setupId !== null) {
      throw createJobError(`${logPrefix} setup PR has already been created`);
    } else if(repoEntry.issueId !== null) {
      // Issue has been created, so we check it's status
      const issue = await getIssue({
        github, installationId, owner, repo, number: repoEntry.issueId
      }).catch(e => {
        throw createJobError(`${logPrefix} error checking issue status`, e);
      });
      if(issue.state !== 'closed') {
        // Can't do anything until the issue is closed
        throw createJobError(`${logPrefix} issue has already been created`);
      }
    }
  }

  // Check if there is a config file
  const config = await getFile({
    github, installationId, owner, repo, path: configFileName
  }).catch(() => {
    // do nothing
  });

  // If there is a config, move on to finalizing the repo and creating watches
  if(config) {
    console.log(`${logPrefix} Config file found, creating repo and finalize job`);
    await updateOrCreateRepo({
      service: reposService, repo, owner, githubId: repoId, installationId
    }).catch(e => {
      throw createJobError(`${logPrefix} error creating repo after config file was found`, e);
    });
    await createIssue({
      github, installationId, owner, repo, title: 'ReleaseHawk is ready', body: getConfigExistsPRContent({ repo: `${owner}/${repo}`}), labels: [labelName]
    }).catch(e => {
      throw createJobError(`${logPrefix} Error creating an issue after cloning repository failed`, e);
    });
    return finalizeQueue.create({installationId, repository});
  }

  // Create label
  console.log(`${logPrefix} Creating label`);
  await createLabel({
    github, installationId, owner, repo, name:  labelName, color: labelColor
  }).catch(() => {
    //Do nothing if this fails.
  });

  // Clone repo
  console.log(`${logPrefix} Cloning repository`);
  await cloneRepo({
    github, installationId, owner, repo, path: workingPath, branch: defaultBranch
  }).catch(async e => {
    throw createJobError(`${logPrefix} Error cloning repository`, e);
  });

  // Create a branch to work in
  console.log(`${logPrefix} Creating branch '${branchName}'`);
  await createBranch({
    github, installationId, path: workingPath, branch: branchName
  }).catch (e => {
    // TODO: What if there is an existing branch?
    throw createJobError(`${logPrefix} Error creating branch '${branchName}'`, e);
  });

  // Write a starter config file
  console.log(`${logPrefix} Writing starter config file`);
  await writeFile({
    path: workingPath, name: configFileName, contents: getStarterConfig()
  }).catch(e => {
    throw createJobError(`${logPrefix} Error writing starter configuration file`, e);
  });

  // Create a commit
  console.log(`${logPrefix} Creating commit`);
  await createCommit({
    github, path: workingPath, message: 'Adding starter config for releasehawk'
  }).catch(e => {
    throw createJobError(`${logPrefix} Error comitting changes`, e);
  });

  // Push branch to origin
  console.log(`${logPrefix} Pushing branch '${branchName}'`);
  await pushBranch({
    github, installationId, owner, repo, path: workingPath, branch: branchName
  }).catch(e => {
    throw createJobError(`${logPrefix} Error pushing branch '${branchName}'`, e);
  });

  // Cleanup
  console.log(`${logPrefix} Cleaning up files`);
  await fse.remove(basePath).catch(() => {
    // nothing
  });

  // Create a PR
  console.log(`${logPrefix} Creating pull request`);
  const pr = await createPullRequest({
    github, installationId, owner, repo, head: branchName, base: defaultBranch, title: 'Setup ReleaseHawk', body: getInitialPRContent({ repo: `${owner}/${repo}`, branch: branchName}), labels: [labelName]
  }).catch (e => {
    throw createJobError(`${logPrefix} Error creating a pull request`, e);
  });

  // Add label
  console.log(`${logPrefix} Adding label to pull request`);
  await addLabel({
    github, installationId, owner, repo, number: pr.number, labels: [labelName]
  }).catch(e => {
    throw createJobError(`${logPrefix} Error adding label`, e);
  });

  console.log(`${logPrefix} Updating repo`);
  return updateOrCreateRepo({
    service: reposService, repoEntry, pr, repo, owner, githubId: repoId, installationId
  });
}

module.exports = function setup(app, options) {
  const basePath = path.join(process.cwd(), app.get('workPath'), uuidv4());
  options.basePath = basePath;
  return _setup(app, options).catch(e => {
    fse.removeSync(basePath);
    throw e;
  });
};
