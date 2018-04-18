// Initializes the `repos` service on path `/repos`
const createService = require('feathers-sequelize');
const createModel = require('../../models/repos.model');
const hooks = require('./repos.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'repos',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/repos', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('repos');

  service.hooks(hooks);
};
