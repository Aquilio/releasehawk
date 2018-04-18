module.exports = async function createCommit(octokit, github, installationId, repo, branchName, message) {
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
