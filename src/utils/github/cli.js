const execa = require('execa');


module.exports = function (options) {
  return new Github(Object.assign(options, {
    headers: {
      'User-Agent': 'Releasehawk'
    }
  }));
};
