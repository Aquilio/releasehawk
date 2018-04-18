/**
 * Create a pull request.
 * @param {Object} options
 * @param {Object} options.github
 * @param {string|number} options.installationId
 * @param {string} options.branch name of branch
 * @param {string} options.base name of branch
 * @param {string} options.owner owner of repo
 * @param {string} options.repo name of repo
 * @return {Promise<Object>} the repository
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
