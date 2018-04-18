const dehydrate = require('feathers-sequelize/hooks/dehydrate');

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
  };
}

module.exports = {
  before: {
    all: [],
    find: [includeWatches()],
    get: [includeWatches()],
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
