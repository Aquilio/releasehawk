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
async function isDirty(
  {github, path}
) {
  if (!await fse.exists(path)) {
    return Promise.reject('path to repository not found, try cloning the repo first');
  }
  const cli = await github.getCli({
    options: {
      cwd: path
    }
  });
  const result = await cli(['status']).catch(e => {
    return Promise.reject(e);
  });
  if(result.stdout.indexOf('nothing to commit, working directory clean') !== -1) {
    return Promise.resolve(false);
  }
  return Promise.resolve(true);
}

module.exports = isDirty;
