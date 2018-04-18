module.exports = async function pushBranch(octokit, github, installationId, repo, branchName) {
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
};
