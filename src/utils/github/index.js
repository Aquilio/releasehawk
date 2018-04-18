const makeGetAppToken = require('./get-app-token');
const makeGetInstallationToken = require('./get-installation-token');
const getEventType = require('./get-event-type');
const getOctokit = require('./octokit');

module.exports = function (app) {
  const getAppToken = makeGetAppToken(app);
  const getInstallationToken = makeGetInstallationToken(getAppToken);

  const github = {
    getAppToken,
    getInstallationToken,
    getEventType,
    getOctokit,
    api,
    cli
  };

  app.set('github', github);
};
