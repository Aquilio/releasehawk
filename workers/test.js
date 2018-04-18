// Just some tests to play with GitHub App API
// const octokit = require('@octokit/rest')();
const setup =

async function doStuff() {
  const appToken = await github.getAppToken();
  // const headers = {
  //   accept: 'application/vnd.github.machine-man-preview+json',
  //   'Authorization': `Bearer ${appToken}`
  // };
  octokit.authenticate({ type: 'integration', token: appToken });
  // const result = await octokit.apps.get({});
  // const installations = await octokit.apps.getInstallations({});
  // const installation = await octokit.apps.getInstallation(Object.assign({ installation_id: 131495 }, {}));
  // // const tokenResult = await octokit.apps.createInstallationToken(Object.assign({ installation_id: 131495 }, { headers }));
  // const installationToken = await github.getInstallationToken(131495);

  // octokit.authenticate({ type: 'token', token: installationToken });
  // // const installationHeaders = Object.assign({}, headers, {
  // //   'Authorization': `Bearer ${installationToken}`
  // // })
  // const repos = await octokit.apps.getInstallationRepositories({});

  const gh = require('./utils/github')(app, 131495);
  const repoInfo = await gh.getRepo(130156042);
  // const addRepoResult = await octokit.apps.getInstallationRepositories(Object.assign({ installation_id: 131495, repository_id:  }, { headers: installationHeaders }));
  return Promise.resolve();
}

doStuff().then(() => {
  console.log('Finished!');
  process.exit(0);
});
