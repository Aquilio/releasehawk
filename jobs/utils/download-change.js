/**
 * Download the latest update from the release target.
 *
 * @return {Object} the latest update
 */

const download = require('download');
const parseGitHubUrl = require('parse-github-url');
module.exports = async function downloadLatestChange({
  target, change, path
}) {
  const { owner, name } = parseGitHubUrl(target);
  let url;
  switch(change.type) {
  case 'commit':
    url = `https://github.com/${owner}/${name}/archive/${change.payload.sha}.zip`;
    // https://github.com/:owner/:repo/archive/:sha.zip
    break;
  case 'tag':
    url = `https://github.com/${owner}/${name}/archive/${change.payload.name}.zip`;
    // https://github.com/:owner/:repo/archive/:tagName.zip
    break;
  case 'release':
    url = `https://github.com/${owner}/${name}/archive/${change.payload.tag_name}.zip`;
    break;
  default:
    break;
  }
  return download(url, path, { extract: true, strip: 1, mode: '666', headers: { accept: 'application/zip' } });
};
