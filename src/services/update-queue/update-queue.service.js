const createService = require('../../../custom_modules/feathers-amqp');
const queueOptions = require('../../queues/update.queue');
const hooks = require('./update-queue.hooks');

module.exports = function (app) {
  const options = {
    queue: queueOptions(app)
  };

  // Initialize our service with any options it requires
  app.use('/update-queue', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('update-queue');

  service.hooks(hooks);
};
