const fse = require('fs-extra');

/**
 * Add current modified files in file system and create a commit
 *
 * @param {Object} options
 * @param {string} options.path path where repo lives
 * @param {string} options.message commit message
 * @return {Promise<Object>}
 */
async function createCommit(
  {github, path, message}
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
  // TODO: Should these be in their own file?
  const status = await cli(['status']);
  // TODO: Verify there are modified files
  const addResult = await cli(['add', '.']);
  // TODO: check add Result
  return cli(['commit', '-m', message]);
}

module.exports = createCommit;
