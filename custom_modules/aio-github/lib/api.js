const promiseRetry = require('promise-retry');
const errorCodes = ['ETIMEDOUT', 'ECONNREFUSED', 'ECONNRESET', 'ESOCKETTIMEDOUT', 'EAI_AGAIN'];

function ghRetry (octokit) {
  octokit.hook.error('request', (error, options) => {
    const type = error.code || error.message;
    if (!errorCodes.includes(type)) {
      throw error;
    }

    return promiseRetry(retry => {
      return octokitRequest(options).catch(error => {
        const type = error.code || error.message;
        if (!errorCodes.includes(type)) {
          throw error;
        }

        retry(error);
      });
    }, {
      retries: 5,
      minTimeout: 3000
    });
  });
}

const Octokit = require('@octokit/rest');
const octokitRequest = require('@octokit/rest/lib/request');
const getOctoKit = function (options) {
  const octokit = new Octokit(options);
  octokit.plugin(ghRetry);

  return octokit;
};

module.exports = function (options = {}) {
  return getOctoKit(Object.assign(options, {
    headers: {
      'User-Agent': 'ReleaseHawk'
    }
  }));
};
