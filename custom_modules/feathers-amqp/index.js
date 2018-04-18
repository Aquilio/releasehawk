const errors = require('@feathersjs/errors');

class Service {
  constructor(options) {
    if (!options) {
      throw new Error('amqp options have to be provided');
    }

    if (!options.queue) {
      throw new Error('You must provide an amqp queue option');
    }

    this.queueName = options.queue.name;
    this.queueOptions = options.queue.options || {};
    this.sendOptions = options.queue.sendOptions || {};
  }
  // find(params) {}
  // get(id, params) {}
  create(data) {
    return new Promise((resolve, reject) => {
      if (!this.channel) {
        reject(new errors.GeneralError('AMQP channel not found'));
      }

      try {
        const result = this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(data)), this.sendOptions);
        resolve(result);
      } catch(e) {
        debugger
        reject(e);
      }
    });
  }
  // update(id, data, params) {}
  // patch(id, data, params) {}
  // remove(id, params) {}
  async setup(app) {
    this.app = app;
    const amqpInit = app.get('amqpInit');
    try {
      this.conn = await amqpInit;
      this.channel = await this.conn.createChannel();
      this.channel.assertQueue(this.queueName, this.queueOptions);
    } catch (e) {
      console.error('feathers-amqp: Cannot create channel', e.message);
    }
    // TODO: Handle channel closing (reopen?)
  }
}

function init (options) {
  return new Service(options);
}

module.exports = init;

Object.assign(module.exports, {
  default: init,
  Service
});
