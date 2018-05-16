const { disablePagination, disallow, iff, isProvider } = require('feathers-hooks-common');
const { authenticate } = require('@feathersjs/authentication').hooks;
const dehydrate = require('feathers-sequelize/hooks/dehydrate');

function includeRepo() {
  return function(context) {
    const reposModel = context.app.service('repos').Model;
    const association = {
      include: [{
        model: reposModel,
        as: 'repo'
      }],
    };
    context.params.sequelize = Object.assign(association, { raw: false });
    return context;
  };
}

module.exports = {
  before: {
    all: [iff(isProvider('external'), authenticate(['jwt']))],
    find: [disablePagination(), includeRepo()],
    get: [includeRepo()],
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
