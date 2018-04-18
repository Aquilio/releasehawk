/**
 * Get a repo's information.
 * Retrieves all repos for the `installationId` and then filters on the `repoId`
 * @param {Object} options
 * @param {Object} options.github
 * @param {string|number} options.installationId
 * @param {string} options.repoId id of repository
 * @return {Promise<Object>} the repository
 */
async function getBranch(
  {github, installationId, owner, repo, branch}
) {
  const api = github.getApi();
  const token = await github.getInstallationToken(installationId);
  api.authenticate({ type: 'token', token });
  const b = (await api.repos.getBranch({
    owner, repo, branch
  })).data;
  return b;
}

module.exports = getBranch;
