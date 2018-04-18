const createService = require('../../../custom_modules/feathers-amqp');
const queueOptions = require('../../queues/finalize.queue');
const hooks = require('./finalize-queue.hooks');

module.exports = function (app) {
  const options = {
    queue: queueOptions(app)
  };

  // Initialize our service with any options it requires
  app.use('/finalize-queue', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('finalize-queue');

  service.hooks(hooks);
};
