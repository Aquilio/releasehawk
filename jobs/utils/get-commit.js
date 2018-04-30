/**
 * Get a commit
 * @param {Object} options
 * @param {Object} options.github
 * @param {string} options.owner name of owner
 * @param {string} options.repo name of repo
 * @param {string} options.sha sha of tag
 * @return {Promise<Object>}
 */
async function getCommit(
  {github, installationId, owner, repo, sha}
) {
  const api = github.getApi();
  const token = await github.getInstallationToken(installationId);
  api.authenticate({ type: 'token', token });
  const commit = await api.repos.getCommit({ owner, repo, sha });
  return commit.data;

}

module.exports = getCommit;
