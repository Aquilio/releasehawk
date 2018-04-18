const getGithub = require('../custom_modules/aio-github');

module.exports = function (app) {
  const gitHubConfig = app.get('authentication').github;
  const github = getGithub({
    issueId: gitHubConfig.issueID,
    privateKey: gitHubConfig.privateKey
  });

  app.set('github', github);
};
