const fse = require('fs-extra');

/**
 * Create a branch on the file system
 *
 * @param {Object} options
 * @param {Object} options.github
 * @param {string|number} options.installationId
 * @param {string} options.path path to clone repo into
 * @param {string} options.owner owner of repo
 * @param {string} options.repo name of repo
 * @param {string} options.branch name of the branch to create
 * @return {Promise<Object>}
 */
async function createBranch(
  {github, installationId, path, branch}
) {
  if (!await fse.exists(path)) {
    return Promise.reject('path to repository not found, try cloning the repo first');
  }
  const cli = await github.getCli({
    name: 'releasehawk[bot]',
    email: 'bot@releasehawk.com',
    options: {
      cwd: path
    }
  });
  const api = github.getApi();
  const token = await github.getInstallationToken(installationId);
  api.authenticate({ type: 'token', token });
  return cli(['checkout', '-b', branch]);
}

module.exports = createBranch;
