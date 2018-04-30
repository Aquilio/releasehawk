/**
 * Get a branch
 * @param {Object} options
 * @param {Object} options.github
 * @param {string|number} options.installationId
 * @param {string} options.owner owner of repo
 * @param {string} options.repo name of repo
 * @param {string} options.branch name of the branch
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
