/**
 * Get a repo's information.
 * If an installationId is provided, it will retrieve all repos for the
 * installationId and return the repo with id matching `repoId`.
 * Otherwise it uses an un-authenticated request to find owner/repo.
 * @param {Object} options
 * @param {Object} options.github
 * @param {string|number} options.installationId
 * @param {string} options.repoId id of repository
 * @param {string} options.owner name of owner
 * @param {string} options.repo name of repo
 * @return {Promise<Object>} the repository
 */
async function getRepo(
  {github, installationId, repoId, owner, repo}
) {
  const api = github.getApi();
  if(installationId) {
    const token = await github.getInstallationToken(installationId);
    api.authenticate({ type: 'token', token });
    const repositories = (await api.apps.getInstallationRepositories({})).data.repositories;
    return repositories.find(r => r.id === repoId);
  }
  return (await api.repos.get({ owner, repo })).data;

}

module.exports = getRepo;
