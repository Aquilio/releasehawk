const fse = require('fs-extra');
const checkRepoPath = require('./check-repo-path');

module.exports = async function writeFile(octokit, github, installationId, repo, name, contents) {
  const repoPath = await checkRepoPath(...);
  if (!repoPath) {
    return ...
  }
  // TODO: Return name of file if successful
  if(typeof contents === 'object') {
    return fse.writeJson(`${repoPath}/${name}`, contents);
  }
  return fse.outputFile(`${repoPath}/${name}`, contents);
}
