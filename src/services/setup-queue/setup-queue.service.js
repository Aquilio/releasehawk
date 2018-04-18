const createService = require('../../../custom_modules/feathers-amqp');
const queueOptions = require('../../queues/setup.queue');
const hooks = require('./setup-queue.hooks');

module.exports = function (app) {
  const options = {
    queue: queueOptions(app)
  };

  // Initialize our service with any options it requires
  app.use('/setup-queue', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('setup-queue');

  service.hooks(hooks);
};
