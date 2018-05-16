const amqp = require('amqplib');

// TODO: Move this to feathers-amqp
module.exports = function (app) {
  const amqpServer = app.get('amqp');
  const promise = amqp.connect(amqpServer);

  // Create a client to store queues that the app has access to
  app.set('amqp', {
    queues: {},
    define(queueName, options = {}) {
      if (!queueName) {
        throw new Error('amqp define queue name must be provided');
      }
      this.queues[queueName] = options;
      return options;
    },
    get(queueName) {
      return this.queues[queueName] || null;
    },
    remove(queueName) {
      if(this.queues[queueName]) {
        delete this.queues[queueName];
        return true;
      }
      return false;
    }
  });
  app.set('amqpInit', promise);
  promise.catch(e => {
    console.error(`Could connect to AMQP server ${amqpServer}`, e.message);
  });
};
