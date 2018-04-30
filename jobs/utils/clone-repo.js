const fse = require('fs-extra');

/**
 * Clone a repository into a given path on the file system
 *
 * @param {Object} options
 * @param {Object} options.github
 * @param {string|number} options.installationId
 * @param {string} options.path path to clone repo into
 * @param {string} options.owner owner of repo
 * @param {string} options.repo name of repo
 * @param {string} options.branch branch to clone
 * @return {Promise<Object>}
 */
async function cloneRepo(
  {github, installationId, path, owner, repo, branch}
) {
  if (await fse.exists(path)) {
    await fse.remove(path);
  }
  const cli = await github.getCli({
    name: 'releasehawk[bot]',
    email: 'releasehawk@aquil.io',
  });
  const api = github.getApi();
  const token = await github.getInstallationToken(installationId);
  api.authenticate({ type: 'token', token });
  return cli(['clone', '--depth=50', `--branch=${branch}`, `https://x-access-token:${token}@github.com/${owner}/${repo}`, path]);
}

module.exports = cloneRepo;
