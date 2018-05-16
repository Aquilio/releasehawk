const { iff, disallow } = require('feathers-hooks-common');
const { isProduction } = require('../../hooks/predicates');
const validateEventSignature = require('../../hooks/github/validate-event-signature');

module.exports = {
  before: {
    all: [],
    find: [disallow()],
    get: [disallow()],
    create: [iff(isProduction(), validateEventSignature())],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
  },

  after: {
    all: [],
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
