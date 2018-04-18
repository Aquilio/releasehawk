const createService = require('../../../custom_modules/feathers-amqp');
const queueOptions = require('../../queues/release.queue');
const hooks = require('./release-queue.hooks');

module.exports = function (app) {
  const options = {
    queue: queueOptions(app)
  };

  // Initialize our service with any options it requires
  app.use('/release-queue', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('release-queue');

  service.hooks(hooks);
};
