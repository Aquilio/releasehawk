/**
 * Get the latest tag for a repo
 * @param {Object} options
 * @param {Object} options.github
 * @param {string} options.owner name of owner
 * @param {string} options.repo name of repo
 * @return {Promise<Object>}
 */
async function getLatestTag(
  {github, installationId, owner, repo}
) {
  const api = github.getApi();
  const token = await github.getInstallationToken(installationId);
  api.authenticate({ type: 'token', token });
  const tags = await api.repos.getTags({ owner, repo });
  return tags.data[0];
}

module.exports = getLatestTag;
