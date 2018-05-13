const dehydrate = require('feathers-sequelize/hooks/dehydrate');
const { authenticate } = require('@feathersjs/authentication').hooks;
const { iff, isNot, preventChanges, disallow, some } = require('feathers-hooks-common');
const { isAdmin, isOwner } = require('../../hooks/predicates');

module.exports = {
  before: {
    all: [],
    find: [ authenticate('jwt') ],
    get: [ authenticate('jwt') ],
    create: [],
    update: [ disallow('external') ],
    patch: [
      authenticate('jwt'),
      // Only user or admin can change a user
      iff(isNot(some(isOwner(), isAdmin())), disallow()),
      // Prevent a user from changing isAdmin flag
      iff(isNot(isAdmin()), preventChanges(false, ['isAdmin'])),
    ],
    remove: [
      authenticate('jwt'),
      // Only an admin can remove a user
      iff(isNot(isAdmin()), disallow())
    ]
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
