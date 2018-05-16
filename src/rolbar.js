const Rollbar = require('rollbar');


module.exports = function (app) {
  const config = app.get('roolbar');
  const rollbar = new Rollbar({
    accessToken: config.token,
    environment: process.env.NODE_ENV || 'development',
    endpoint: config.endpoint,
    captureUncaught: true,
    captureUnhandledRejections: true
  });

  app.set('rollbar', rollbar);
};



