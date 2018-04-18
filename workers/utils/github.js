const path = require('path');
const fse = require('fs-extra');
const execa = require('execa');

const WORK_PATH = path.join(process.cwd(), '/tmp');
async function getRepoPath (repo) {
  const repoPath = `${WORK_PATH}/${repo.full_name}`;
  if (!await fse.exists(repoPath)) {
    console.error(`${repoPath} does not exist`);
    return null;
  }
  return repoPath;
}

async function getRepo(octokit, github, installationId, repoId) {
  const token = await github.getInstallationToken(installationId);
  octokit.authenticate({ type: 'token', token });
  const repositories = (await octokit.apps.getInstallationRepositories({})).data.repositories;
  return repositories.find(r => r.id === repoId);
}

async function cloneRepo(octokit, github, installationId, repo) {
  const repoPath = await getRepoPath(repo);
  if (repoPath) {
    await fse.remove(repoPath);
  }
  const token = await github.getInstallationToken(installationId);
  return execa('git', ['clone', '--depth=50', `--branch=${repo.default_branch}`, `https://x-access-token:${token}@github.com/${repo.full_name}`, repoPath]);
}

async function writeFile(octokit, github, installationId, repo, name, contents) {
  const repoPath = await getRepoPath(repo);
  if (!repoPath) {
    return Promise.reject('path to repository not found, try cloning the repo first');
  }
  // TODO: Return name of file if successful
  if(typeof contents === 'object') {
    return fse.writeJson(`${repoPath}/${name}`, contents);
  }
  return fse.outputFile(`${repoPath}/${name}`, contents);
}

async function createBranch(octokit, github, installationId, repo, branchName) {
  const repoPath = await getRepoPath(repo);
  if (!repoPath) {
    return Promise.reject('path to repository not found, try cloning the repo first');
  }

  return execa('git', ['checkout', '-b', branchName], {
    cwd: repoPath
  });
}

// async function deleteBranch(octokit, github, installationId, repo, branchName) {
//   const repoPath = await getRepoPath(repo);
//   if (!repoPath) {
//     return Promise.reject('path to repository not found, try cloning the repo first');
//   }

//   const token = await github.getInstallationToken(installationId);
//   octokit.authenticate({ type: 'token', token });

//   await octokit.gitdata.deleteReference({
//     owner: repo.owner,
//     repo: repo.name,
//     ref: `heads/${branchName}`});
// }

async function createCommit(octokit, github, installationId, repo, branchName, message) {
  const repoPath = await getRepoPath(repo);
  if (!repoPath) {
    return Promise.reject('path to repository not found, try cloning the repo first');
  }
  const status = execa('git', ['status'], {
    cwd: repoPath
  });

  await execa('git', ['add', '.'], {
    cwd: repoPath
  });

  return execa('git', ['commit', '-m', message], {
    cwd: repoPath
  });
}

async function pushBranch(octokit, github, installationId, repo, branchName) {
  const repoPath = await getRepoPath(repo);
  if (!repoPath) {
    return Promise.reject('path to repository not found, try cloning the repo first');
  }

  // TODO: Check for existance of branch

  const token = await github.getInstallationToken(installationId);
  octokit.authenticate({ type: 'token', token });
  return execa('git', ['push', `https://x-access-token:${token}@github.com/${repo.full_name}`, branchName], {
    cwd: repoPath
  });
}

async function createPullRequest(octokit, github, installationId, repo, branchName, title, body) {
  const token = await github.getInstallationToken(installationId);
  octokit.authenticate({ type: 'token', token });
  // TODO: Check for existance of branch
  return await octokit.pullRequests.create({
    owner: repo.owner.login,
    repo: repo.name,
    head: branchName,
    base: repo.default_branch,
    title,
    body
  });
}

module.exports = function (app, installationId) {
  const github = app.get('github');
  const octokit = github.getOctokit();
  const applyFn = function (octokit, github, installationId, fn) {
    return fn.bind(null, octokit, github, installationId);
  }.bind(null, octokit, github, installationId);

  return {
    getRepo: applyFn(getRepo),
    cloneRepo: applyFn(cloneRepo),
    writeFile: applyFn(writeFile),
    createBranch: applyFn(createBranch),
    createCommit: applyFn(createCommit),
    pushBranch: applyFn(pushBranch),
    createPullRequest: applyFn(createPullRequest),
    utils: github,
    octokit
  };
};
