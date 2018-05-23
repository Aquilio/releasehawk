/**
 * Queued job runner
 */
const app = require('./src/app');
// setup has to be called so services run their setup funtions
app.setup();

const rollbar = app.get('rollbarInstance');

const jobs = {
  setup: require('./jobs/setup'),
  finalize: require('./jobs/finalize'),
  update: require('./jobs/update')
};

const QUEUE_NAME = process.env.QUEUE;

if(!QUEUE_NAME) {
  console.error('No \'QUEUE_NAME\' specified');
}

if(!jobs[QUEUE_NAME]) {
  console.error(`No ${QUEUE_NAME} job exists`);
}

function makeProcessor(channel) {
  return async function process(msg) {
    console.log(`[${QUEUE_NAME}] Received message`);
    try {
      const result = await jobs[QUEUE_NAME](app, JSON.parse(msg.content.toString()));
    } catch (e) {
      console.error(`[${QUEUE_NAME}] Failed to process message`, e);
      rollbar.critical(`[${QUEUE_NAME}] Failed to process message`, e);
      channel.nack(msg, false, e.retry);
      return;
    }
    channel.ack(msg);
    console.log(`[${QUEUE_NAME}] Processed message successfully`);
    return;
  };
}

async function startProcessing () {
  console.log(`Starting ${QUEUE_NAME} job`);
  const amqpInit = app.get('amqpInit');
  const conn = await amqpInit;
  const channel = await conn.createChannel();
  // TODO: Handle channel disconnects (retry)
  console.log(`[${QUEUE_NAME}] Channel created`);
  const queue = app.get('amqp').get(QUEUE_NAME) || {};

  channel.assertQueue(QUEUE_NAME, queue.options);

  const consumeOptions = {
    noAck: false
  };

  channel.consume(QUEUE_NAME, makeProcessor(channel), consumeOptions);
  console.log(`[${QUEUE_NAME}] Waiting...`);
}

startProcessing();
