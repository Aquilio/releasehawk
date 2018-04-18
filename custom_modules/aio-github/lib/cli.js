const execa = require('execa');

const getCli = function (userOptions = {}) {
  return function cli(args, options = {}) {
    return execa('git', args, Object.assign({}, userOptions, options));
  };
};

module.exports = async function ({ name, email, options }) {
  const cli = getCli(options);
  if (name) {
    await cli(['config', 'user.name', `"${name}"`]);
  }
  if (email) {
    await cli(['config', 'user.email', `"${email}"`]);
  }
  return cli;
};
