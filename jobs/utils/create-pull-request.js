/**
 * Create a pull request.
 * @param {Object} options
 * @param {Object} options.github
 * @param {string|number} options.installationId
 * @param {string} options.owner owner of repo
 * @param {string} options.repo name of repo
 * @param {string} options.head branch/head where changes live
 * @param {string} options.base branch to base PR on
 * @param {string} options.title title of the PR
 * @param {string} options.body body of the PR
 * @return {Promise<Object>} the repository
 */
async function createPullRequest(
  {github, installationId, owner, repo, head, base, title, body}
) {
  const api = github.getApi();
  const token = await github.getInstallationToken(installationId);
  api.authenticate({ type: 'token', token });
  return (await api.pullRequests.create({
    owner, repo, head, base, title, body
  })).data;
}

module.exports = createPullRequest;
