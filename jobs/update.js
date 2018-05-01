/**
 * This job is meant to run via an AMQP queue and should be run after a new
 * installation is confirmed (setup PR is merged).
 * It parses the .releasehawk.yml file and creates a watch for each release repo
 */
const path = require('path');
const uuidv4 = require('uuid/v4');
const fse = require('fs-extra');
const { createJobError } = require('./utils/job-error');
const downloadChange = require('./utils/download-change');
const getRepo = require('./utils/get-repo');
const cloneRepo = require('./utils/clone-repo');
const createIssue = require('./utils/create-issue');
const updateOrCreateRepo = require('./utils/update-create-repo');
const createBranch = require('./utils/create-branch');
const runScript = require('./utils/run-script');
const createCommit = require('./utils/create-commit');
const pushBranch = require('./utils/push-branch');
const createPullRequest = require('./utils/create-pull-request');
const addLabel = require('./utils/add-label');
const isDirty = require('./utils/is-dirty');

async function _update(app, {installationId, watch, settings, change, basePath}) {
  const reposService = app.service('repos');
  const watchesService = app.service('watches');
  const github = app.get('github');
  const branchPrefix = app.get('branchPrefix');
  const {owner, repo} = watch.repo;
  const repoPath = path.join(basePath, owner, repo);
  const changePath = path.resolve(repoPath, settings.destination);
  const branchName = `${branchPrefix}/${watch.target}-${change.checksum}`;
  const labelName = app.get('label').name;
  const logPrefix = `${owner}/${repo} (${watch.target})`;
  console.log(`${logPrefix} Working in ${basePath}`);

  // Get repo
  console.log(`${logPrefix} Getting repository info`);
  const repository = await getRepo({
    github, installationId, repoId: watch.repo.githubId,
  }).catch(e => {
    throw createJobError(`${logPrefix} Error fetching repository`, e);
  });

  // Clone repo
  console.log(`${logPrefix} Cloning repository`);
  await cloneRepo({
    github, installationId, owner, repo, path: repoPath, branch: repository.default_branch
  }).catch(async e => {
    const issue = await createIssue({
      github, installationId, owner, repo, title: 'Uh Oh', body: `There was a problem cloning your repository\nGit said"${getFatalMessage(e)}"\n`, labels: [labelName]
    }).catch(e => {
      throw createJobError(`${logPrefix} Error creating an issue after cloning repository failed`, e);
    });
    if(issue) {
      await updateOrCreateRepo({
        service: reposService, repoEntry: watch.repo, issue, repo, owner, githubId: watch.repo.githubId, installationId
      }).catch(e => {
        throw createJobError(`${logPrefix} Error updating repo after creating when cloning repository failed`, e);
      });
    }
    throw createJobError(`${logPrefix} Error cloning repository`, e);
  });

  // Create a branch to work in
  console.log(`${logPrefix} Creating branch '${branchName}'`);
  await createBranch({
    github, installationId, path: repoPath, branch: branchName
  }).catch (e => {
    throw createJobError(`${logPrefix} Error creating branch '${branchName}'`, e);
  });

  // Download change
  await downloadChange({
    target: watch.target, change, path: changePath
  }).catch(e => {
    throw createJobError(`${logPrefix} Error downloading latest ${change.type}`, e);
  });

  // Run script if there is one
  if(settings.script) {
    await runScript({
      script: settings.script, path: repoPath
    }).catch(async e => {
      const issue = await createIssue({
        github, installationId, owner, repo, title: `Problem handling change from ${watch.target}`, body: `There was a problem running the release script for ${watch.target}\n"${e.message}"\n`, labels: [labelName]
      }).catch(e => {
        throw createJobError(`${logPrefix} Error creating an issue after running script failed`, e);
      });
      if(issue) {
        await updateOrCreateRepo({
          service: reposService, repoEntry: watch.repo, issue, repo, owner, githubId: watch.repo.githubId, installationId
        }).catch(e => {
          throw createJobError(`${logPrefix} Error updating repo after creating issue when running script failed`, e);
        });
      }
      throw createJobError(`${logPrefix} Error running script ${settings.script}`, e);
    });
  }

  // Check if working directory has changes to commit
  console.log(`${logPrefix} Checking for changes to commit`);
  const changesToCommit = await isDirty({
    github, path: repoPath
  }).catch(e => {
    throw createJobError(`${logPrefix} Error checking for changes to commit`, e);
  });

  // Only create a PR if there are changes to commit
  if(changesToCommit) {
    // Create a commit
    console.log(`${logPrefix} Creating commit`);
    await createCommit({
      github, path: repoPath, message: `Adding latest change from ${watch.target} (${change.checksum})`
    }).catch(e => {
      throw createJobError(`${logPrefix} Error comitting changes`, e);
    });

    // Push branch to origin
    console.log(`${logPrefix} Pushing branch '${branchName}'`);
    await pushBranch({
      github, installationId, owner, repo, path: repoPath, branch: branchName
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
      github, installationId, owner, repo, head: branchName, base: repository.default_branch, title: `Update ${watch.target} to latest version`, body: `Upgrading ${watch.target} to ${change.checksum}.`
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
  } else {
    console.log(`${logPrefix} No changes to commit`);
  }

  console.log(`${logPrefix} Updating watch`);
  return watchesService.patch(watch.id, {
    lastUpdate: change.checksum
  });
}

module.exports = function update(app, options) {
  const basePath = path.join(process.cwd(), app.get('workPath'), uuidv4());
  options.basePath = basePath;
  return _update(app, options).catch(e => {
    fse.removeSync(basePath);
    throw e;
  });
};
