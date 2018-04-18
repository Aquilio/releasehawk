const { iff } = require('feathers-hooks-common');
const { isProduction } = require('../../hooks/predicates');
const validateEventSignature = require('../../hooks/github/validate-event-signature');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [iff(isProduction(), validateEventSignature())],
    update: [],
    patch: [],
    remove: []
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
