const fse = require('fs-extra');

/**
 * Writes a file
 *
 * @param {Object} options
 * @param {string} options.path path to write file
 * @param {string} options.name name of the file
 * @param {string|Object} options.contents contents of the file
 * @return {Promise<Object>}
 */
async function writeFile(
  {path, name, contents}
) {
  if (!await fse.exists(path)) {
    return Promise.reject('path to repository not found, try cloning the repo first');
  }
  const filePath = `${path}/${name}`;
  if(typeof contents === 'object') {
    return fse.outputJson(filePath, contents);
  }
  return fse.outputFile(filePath, contents);
}

module.exports = writeFile;
