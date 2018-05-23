const Rollbar = require('rollbar');


module.exports = function (app) {
  const config = app.get('rollbar');
  const instance = new Rollbar({
    accessToken: config.token,
    environment: process.env.NODE_ENV || 'development',
    endpoint: config.endpoint,
    captureUncaught: true,
    captureUnhandledRejections: true
  });

  app.set('rollbarInstance', instance);
};



