const { disablePagination } = require('feathers-hooks-common');
const dehydrate = require('feathers-sequelize/hooks/dehydrate');

function expandRepo() {
  return function(context) {
    if(context.params.query.expand && context.params.query.expand.split(',').includes('repo')) {
      const reposModel = context.app.service('repos').Model;
      const association = {
        include: [{
          model: reposModel,
          as: 'repo'
        }],
      };
      context.params.sequelize = Object.assign(association, { raw: false });
      delete context.params.query.expand;
    }
    return context;
  };
}

module.exports = {
  before: {
    all: [],
    find: [disablePagination(), expandRepo()],
    get: [expandRepo()],
    create: [],
    update: [],
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
