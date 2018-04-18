module.exports = async function createPullRequest(octokit, github, installationId, repo, branchName, title, body) {
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
};
