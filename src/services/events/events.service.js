// Initializes the `events` service on path `/events`
const createService = require('./events.class.js');
const hooks = require('./events.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');

  const options = {
    name: 'events',
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/events', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('events');

  service.hooks(hooks);
};
