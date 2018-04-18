const app = require('../src/app');

// setup has to be called so services run their setup funtions
app.setup();
const watchesService = app.service('watches');

function updateWatch(watch, update) {
  return watchesService.patch(watch.id, update);
}

function makeProcessor(channel) {
  return async function processRelease(msg) {
    const { watch, release } = JSON.parse(msg.content.toString());
    console.log(`[${watch.repo}] Received`);
    // TODO: Do the stuff
    await updateWatch(watch, {
      lastReleasedAt: release.published_at
    });
    console.log(`[${watch.repo}] Done`);
    channel.ack(msg);
  }
}

async function startProcessing () {
  console.log('Starting release processing worker');
  const amqpInit = app.get('amqpInit');
  const conn = await amqpInit;
  const channel = await conn.createChannel();
  const queueName = 'release';
  const queue = app.get('amqp').get(queueName) || {};

  channel.assertQueue(queueName, queue.options);

  const consumeOptions = {
    noAck: false
  };

  channel.consume(queueName, makeProcessor(channel), consumeOptions);
}

startProcessing();

