/**
 * Get a repo's information.
 * Retrieves all repos for the `installationId` and then filters on the `repoId`
 * @param {Object} options
 * @param {Object} options.github
 * @param {string|number} options.installationId
 * @param {string} options.repoId id of repository
 * @return {Promise<Object>} the repository
 */
async function getFile(
  {github, installationId, owner, repo, path}
) {
  const api = github.getApi();
  const token = await github.getInstallationToken(installationId);
  api.authenticate({ type: 'token', token });
  return (await api.repos.getContent({
    owner, repo, path
  })).data;
}

module.exports = getFile;
