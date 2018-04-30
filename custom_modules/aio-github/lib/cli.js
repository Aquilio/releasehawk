const execa = require('execa');

const getCli = function (userOptions = {}) {
  return function cli(args, options = {}) {
    return execa('git', args, Object.assign({}, userOptions, options));
  };
};

module.exports = function ({ name, email, options }) {
  const cli = getCli(options);
  // Check if cwd is a git directory and set user configs
  return cli(['rev-parse', '--git-dir']).then(async () => {
    if (name) {
      await cli(['config', 'user.name', `"${name}"`]);
    }
    if (email) {
      await cli(['config', 'user.email', `"${email}"`]);
    }
    return cli;
  }).catch(() => {
    // Not in a git repo so don't set configs
    return cli;
  });
};
