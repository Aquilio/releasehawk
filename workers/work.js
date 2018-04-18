// Just some tests to play with GitHub App API
// const octokit = require('@octokit/rest')();
const path = require('path');
const execa = require('execa');

const app = require('../src/app');
// setup has to be called so services run their setup funtions
app.setup();

const gitHubConfig = app.get('authentication').github;
const github = app.get('github');
const ghApi = github.getApi();
const ghCli = github.getCli();

async function doStuff() {


  (app, 131495) ;
  const repo = await gh.getRepo(130156042);
  const result = await gh.cloneRepo(repo);
  const branch = await gh.createBranch(repo, 'init-releasehawk');
  const file = await gh.writeFile(repo, 'releasehawk.json', {
    'feathersjs/feathers': 'bin/dostuff'
  });
  const commit = await gh.createCommit(repo, 'init-releasehawk', 'adding config for releasehawk');
  const push = await gh.pushBranch(repo, 'init-releasehawk');
  try {
    const pr = (await gh.createPullRequest(repo, 'init-releasehawk', 'Test PR for Releasehawk', 'Hello from releasehawk!')).data;
  } catch (e) {
    console.error(e);
  }
  return Promise.resolve();
}

doStuff().then(() => {
  console.log('Finished!');
  process.exit(0);
});
