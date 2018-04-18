const fse = require('fs-extra');

/**
 * Push a branch
 *
 * @param {Object} options
 * @param {Object} options.github
 * @param {string|number} options.installationId
 * @param {string} options.path path to repo
 * @param {string} options.branch name of the branch to create
 * @return {Promise<Object>}
 */
async function pushBranch(
  {github, installationId, path, owner, repo, branch}
) {
  if (!await fse.exists(path)) {
    return Promise.reject('path to repository not found, try cloning the repo first');
  }
  const cli = await github.getCli({
    name: 'releasehawk[bot]',
    email: 'releasehawk@aquil.io',
    options: {
      cwd: path
    }
  });
  const api = github.getApi();

  const branchStatus = await cli(['branch']);
  // TODO: check we are on the right branch
  const token = await github.getInstallationToken(installationId);
  api.authenticate({ type: 'token', token });
  return cli(['push', `https://x-access-token:${token}@github.com/${owner}/${repo}`, branch]);
}

module.exports = pushBranch;
