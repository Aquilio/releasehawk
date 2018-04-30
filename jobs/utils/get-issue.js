/**
 * Get an issue.
 * @param {Object} options
 * @param {Object} options.github
 * @param {string|number} options.installationId
 * @param {string} options.owner owner of repo
 * @param {string} options.repo name of repo
 * @param {string} options.number number of the issue
 * @return {Promise<Object>} the repository
 */
async function createIssue(
  {github, installationId, owner, repo, number}
) {
  const api = github.getApi();
  const token = await github.getInstallationToken(installationId);
  api.authenticate({ type: 'token', token });
  return (await api.issues.get({
    owner, repo, number
  })).data;
}

module.exports = createIssue;
