const execa = require('execa');
const fse = require('fs-extra');

/**
 * Run a script
 *
 * @param {Object} options
 * @param {string} options.script script to run
 * @param {string} options.path working directory
 * @return {Promise<Object>}
 */
async function runScript({
  script, path
}) {
  if (!await fse.exists(path)) {
    return Promise.reject(`path (${path}) to script not found`);
  }
  const args = script.split(' ');
  const command = args.pop();
  // Ensure script is executable
  await execa('chmod', ['a+x', command], {
    cwd: path
  });
  return execa(command, args, {
    cwd: path
  });
}

module.exports = runScript;
