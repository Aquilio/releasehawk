const fse = require('fs-extra');

module.exports = async function checkRepoPath (path) {
  if (!await fse.exists(path)) {
    return Promise.reject('path to repository not found, try cloning the repo first');
  }
  return Promise.resolve(true);
}
