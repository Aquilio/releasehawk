// Initializes the `watches` service on path `/watches`
const createService = require('feathers-sequelize');
const createModel = require('../../models/watches.model');
const hooks = require('./watches.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'watches',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/watches', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('watches');

  service.hooks(hooks);
};
