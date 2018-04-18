/**
 * Create an application token to authenticate as a GitHub app
 * https://developer.github.com/apps/building-github-apps/authentication-options-for-github-apps/#authenticating-as-a-github-app
 */

const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');

module.exports = function ({ issueId, privateKey }) {
  return async function getAppToken() {
    return new Promise((resolve, reject) => {
      if(!issueId) {
        reject('issueId is required.');
      }
      if(!privateKey) {
        reject('privateKey is required.');
      }

      jwt.sign({}, privateKey, {
        jwtid: uuidv4(),
        algorithm: 'RS256',
        expiresIn: '10m',
        issuer: issueId
      }, (error, token) => {
        if (error) {
          return reject(error);
        }
        return resolve(token);
      });
    });
  };
};
