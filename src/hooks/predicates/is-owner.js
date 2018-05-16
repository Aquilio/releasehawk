const get = require('lodash/get');

module.exports = function({ idField, ownerField }) {
  return function({ params, data }) {
    if (!params.user) {
      return false;
    }
    const id = get(params.user, idField);

    if (typeof id === 'undefined') {
      return false;
    }

    if(get(data, ownerField) !== id) {
      return false;
    }

    return true;
  };
};
