const get = require('lodash/get');

module.exports = function () {
  return context => get(context, 'params.user.isAdmin');
};
