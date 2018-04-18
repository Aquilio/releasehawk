const yaml = require('js-yaml');
const getFile = require('./get-file');

/**
 * Return the parsed config file
 *
 * @return {string}
 */
async function getConfig(
  {github, installationId,  owner, repo}
) {
  const file = await getFile({
    github, installationId,  owner, repo, path: '.releasehawk.yml'
  });

  return yaml.safeLoad(Buffer.from(file.content, 'base64').toString());
}

module.exports = getConfig;
