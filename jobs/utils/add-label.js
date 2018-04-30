/**
 * Adds a label to an issue.
 * @param {Object} options
 * @param {Object} options.github
 * @param {string|number} options.installationId
 * @param {string} options.owner owner of repo
 * @param {string} options.repo name of repo
 * @param {string} options.number number of the issue
 * @param {string} options.labels labels to add to the issue
 * @return {Promise<Object>}
 */
async function addLabel(
  {github, installationId, owner, repo, number, labels}
) {
  const api = github.getApi();
  const token = await github.getInstallationToken(installationId);
  api.authenticate({ type: 'token', token });
  return (await api.issues.addLabels({
    owner, repo, number, labels
  })).data;
}

module.exports = addLabel;
