const checkRepoPath = require('./check-repo-path');

module.exports = async function createBranch(octokit, github, installationId, repo, branchName) {
  const repoPath = ...
  const repoPath = await checkRepoPath(repo);
  if (!repoPath) {
    return Promise.reject('path to repository not found, try cloning the repo first');
  }

  return execa('git', ['checkout', '-b', branchName], {
    cwd: repoPath
  });
}
