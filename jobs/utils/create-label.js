/**
 * Creates a label
 * @param {Object} options
 * @param {Object} options.github
 * @param {string|number} options.installationId
 * @param {string} options.owner owner of repo
 * @param {string} options.repo name of repo
 * @param {string} options.name name of the label
 * @param {string} options.color color of the label (hex without the #)
 * @return {Promise<Object>}
 */
async function createLabel(
  {github, installationId, owner, repo, name, color}
) {
  const api = github.getApi();
  const token = await github.getInstallationToken(installationId);
  api.authenticate({ type: 'token', token });
  return api.issues.createLabel({
    owner, repo, name, color
  });
}

module.exports = createLabel;
