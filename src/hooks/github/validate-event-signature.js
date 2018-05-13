/**
 * Validate an event is coming from GitHub.
 *
 * Docs: https://developer.github.com/webhooks/securing/
 *
 * Read the signature from the X-Hub-Signature header and compare it to the
 * signature created using the event payload and our webhook secret.
 */
const crypto = require('crypto');
const errors = require('@feathersjs/errors');

module.exports = function() {
  return function validateEventSignature(context) {
    const githubConfig = context.app.get('authentication').github;
    const webhookSecret = githubConfig.webhookSecret;
    const payload = JSON.stringify(context.data);
    const eventSignature = context.params.headers['x-hub-signature'];

    return new Promise((resolve, reject) => {

      if(typeof eventSignature === 'undefined') {
        reject(new errors.BadRequest('event signature is not present'));
      }

      const computedSignature = `sha1=${crypto.createHmac('sha1', webhookSecret).update(payload).digest('hex')}`;

      if(crypto.timingSafeEqual(Buffer.from(eventSignature), Buffer.from(computedSignature))) {
        resolve();
      }
      reject(new errors.BadRequest('event signature is not valid'));
    });
  };
};
