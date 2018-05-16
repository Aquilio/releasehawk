const dehydrate = require('feathers-sequelize/hooks/dehydrate');
const { authenticate } = require('@feathersjs/authentication').hooks;
const { disablePagination, disallow, iff, isProvider } = require('feathers-hooks-common');

function includeWatches() {
  return function(context) {
    const watchesModel = context.app.service('watches').Model;
    const association = {
      include: [{
        model: watchesModel,
        as: 'watches'
      }],
    };
    context.params.sequelize = Object.assign(association, { raw: false });
    return context;
  };
}

module.exports = {
  before: {
    all: [iff(isProvider('external'), authenticate(['jwt']))],
    find: [disablePagination(), includeWatches()],
    get: [includeWatches()],
    create: [],
    update: [disallow('external')],
    patch: [],
    remove: []
  },

  after: {
    all: [dehydrate()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
