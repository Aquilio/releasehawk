/**
 * @param {Object} options
 * @param {Object} options.github
 * @param {string} options.owner name of owner
 * @param {string} options.repo name of repo
 * @param {string} options.sha sha of tag
 * @return {Promise<Object>} the repository
 */
async function getTag(
  {github, installationId, owner, repo, sha}
) {
  const api = github.getApi();
  const token = await github.getInstallationToken(installationId);
  api.authenticate({ type: 'token', token });
  const tag = await api.gitdata.getTag({ owner, repo, sha });
  return tag.data;

}

module.exports = getTag;
