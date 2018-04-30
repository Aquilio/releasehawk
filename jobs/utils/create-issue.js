/**
 * Create an issue.
 * @param {Object} options
 * @param {Object} options.github
 * @param {string|number} options.installationId
 * @param {string} options.owner owner of repo
 * @param {string} options.repo name of repo
 * @param {string} options.title title of the issue
 * @param {string} options.body body of the issue
 * @param {Array<String>} options.labels labels to apply to the issue
 * @return {Promise<Object>}
 */
async function createIssue(
  {github, installationId, owner, repo, title, body, labels}
) {
  const api = github.getApi();
  const token = await github.getInstallationToken(installationId);
  api.authenticate({ type: 'token', token });
  return (await api.issues.create({
    owner, repo, title, body, labels
  })).data;
}

module.exports = createIssue;
