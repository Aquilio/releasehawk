/**
 * Get a repo's information.
 * Retrieves all repos for the `installationId` and then filters on the `repoId`
 * @param {Object} options
 * @param {Object} options.github
 * @param {string|number} options.installationId
 * @param {string} options.repoId id of repository
 * @return {Promise<Object>} the repository
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
