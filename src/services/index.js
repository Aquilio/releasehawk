const watches = require('./watches/watches.service.js');
const releaseQueue = require('./release-queue/release-queue.service.js');
const setupQueue = require('./setup-queue/setup-queue.service.js');
const finalizeQueue = require('./finalize-queue/finalize-queue.service.js');
const users = require('./users/users.service.js');
const events = require('./events/events.service.js');
const repos = require('./repos/repos.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(watches);
  app.configure(releaseQueue);
  app.configure(setupQueue);
  app.configure(finalizeQueue);
  app.configure(users);
  app.configure(events);
  app.configure(repos);
};
