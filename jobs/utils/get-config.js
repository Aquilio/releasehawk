const yaml = require('js-yaml');
const getFile = require('./get-file');

/**
 * Parse config, making sure defaults and enums are present.
 *
 * @param {Object} config
 */
function parseConfig(config) {
  Object.keys(config).forEach(target => {
    const settings = config[target];
    settings.type = settings.type || 'release';
  });
  return config;
}
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

  const config = yaml.safeLoad(Buffer.from(file.content, 'base64').toString());
  return Promise.resolve(parseConfig(config));
}

module.exports = getConfig;
