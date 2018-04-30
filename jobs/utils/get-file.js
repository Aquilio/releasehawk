/**
 * Get a file from the repo
 * @param {Object} options
 * @param {Object} options.github
 * @param {string|number} options.installationId
 * @param {string} options.owner name of owner
 * @param {string} options.repo name of repo
 * @param {string} options.path path the file
 * @return {Promise<Object>}
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
