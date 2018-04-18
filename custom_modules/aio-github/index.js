const makeGetAppToken = require('./lib/get-app-token');
const makeGetInstallationToken = require('./lib/get-installation-token');
const getApi = require('./lib/api');
const getCli = require('./lib/cli');

module.exports = function (options) {
  const getAppToken = makeGetAppToken(options);
  const getInstallationToken = makeGetInstallationToken(getAppToken);

  return {
    getAppToken,
    getInstallationToken,
    getApi,
    getCli
  };
};
