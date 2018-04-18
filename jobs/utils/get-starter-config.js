const yaml = require('js-yaml');

/**
 * Create a starter config YAML
 *
 * @return {string}
 */
function getStarterConfig() {
  const blankConfig = {
    'owner/repo': {
      destination: './vendor/repo',
      script: './bin/handle-release.sh'
    }
  };
  return yaml.safeDump(blankConfig);
}

module.exports = getStarterConfig;
