/**
 * Create an installation token to authenticate as a GitHub app installation
 * https://developer.github.com/apps/building-github-apps/authentication-options-for-github-apps/#authenticating-as-a-github-app
 */

// TODO: use a cache to only make this request when the old token has expired
const getApi = require('./api');
const retry = require('retry-promise').default;

module.exports = function(getAppToken) {
  return async function getInstallationToken(installation_id) {
    const appToken = await getAppToken();
    const api = getApi();
    api.authenticate({
      type: 'app',
      token: appToken
    });
    const result = (await api.apps.createInstallationToken({
      installation_id
    })).data;
    // Ensure token is valid
    api.authenticate({ type: 'token', token: result.token });
    await retry(
      {
        max: 5,
        backoff: 300
      },
      () => api.misc.getRateLimit({})
    );

    return result.token;
  };
};
