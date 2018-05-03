/**
 * Get the latest commit from a repository
 * @param {Object} options
 * @param {Object} options.github
 * @param {string} options.owner name of owner
 * @param {string} options.repo name of repo
 * @param {string} options.re regex to filter
 * @return {Promise<Object>}
 */
async function getLatestCommit(
  {github, installationId, owner, repo, re}
) {
  const api = github.getApi();
  const token = await github.getInstallationToken(installationId);
  api.authenticate({ type: 'token', token });
  const commits = (await api.repos.getCommits({ owner, repo })).data;
  if(re) {
    return commits.filter(({commit}) => {
      return re.test(commit.message);
    })[0];
  }
  return commits[0];
}

module.exports = getLatestCommit;
