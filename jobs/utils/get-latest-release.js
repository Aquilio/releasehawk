/**
 * Gets the latest release for a repo
 * @param {Object} options
 * @param {Object} options.github
 * @param {string} options.owner name of owner
 * @param {string} options.repo name of repo
 * @return {Promise<Object>}
 */
async function getLatestRelease(
  {github, installationId, owner, repo}
) {
  const api = github.getApi();
  const token = await github.getInstallationToken(installationId);
  api.authenticate({ type: 'token', token });
  return (await api.repos.getLatestRelease({ owner, repo })).data;

}

module.exports = getLatestRelease;
