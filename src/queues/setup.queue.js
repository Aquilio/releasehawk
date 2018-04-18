module.exports = function (app) {
  const amqpLib = app.get('amqp');
  const name = 'setup';

  const queue = amqpLib.define(name, {
    name,
    options: {
      durable: true
    },
    sendOptions: {
      persistent: true
    }
  });

  return queue;
};
