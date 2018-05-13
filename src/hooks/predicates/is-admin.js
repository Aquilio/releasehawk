const get = require('lodash/get');

module.exports = function(context) {
  return get(context, 'params.user.isAdmin');
};
