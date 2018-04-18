const octokit = require('@octokit/rest')();
const execa = require('execa');
const app = require('../src/app');
// setup has to be called so services run their setup funtions
app.setup();

const github = app.get('github');
const Github = github.Github;
const watchesService = app.service('watches');

function updateWatch(watch, update) {
  return watchesService.patch(watch.id, update);
}

// Clone repo (shallow)
// Check for config file
// if config
// register watches (or report errors)

// if no config
// create new branch 'releasehawk-init'
// create config file with demo instructions
// create PR with details

async function getRepo(installationId, repoId) {
  const token = await github.getInstallationToken(installationId);
  const gh = Github();
  gh.authenticate({ type: 'token', token });
  const repositories = (gh.apps.getInstallationRepositories({})).data.repositories;
  return repositories.find(r => r.id === repoId);
}

// async function cloneRepo(name) {
//   `git clone https://x-access-token:<token>@github.com/${name}.git`

// }

function makeProcessor(channel) {
  return async function processSetup(msg) {
    const { installationId, repo, repoId } = JSON.parse(msg.content.toString());
    console.log(`[${repo}] Received`);
    const repoInfo = await getRepo(installationId, repoId);
    console.log(repoInfo);
    // const cloneResult = execa('git')
    console.log(`[${repo}] Done`);
    channel.ack(msg);
  };
}

async function startProcessing () {
  console.log('Starting setup processing worker');
  const amqpInit = app.get('amqpInit');
  const conn = await amqpInit;
  const channel = await conn.createChannel();
  const queueName = 'setup';
  const queue = app.get('amqp').get(queueName) || {};

  channel.assertQueue(queueName, queue.options);

  const consumeOptions = {
    noAck: false
  };

  channel.consume(queueName, makeProcessor(channel), consumeOptions);
}

startProcessing();
