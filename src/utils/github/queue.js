const Queue = require('promise-queue');
const getInstallationToken = require('./get-installation-token');
const Github = require('./github');

const writeQueue = new Queue(1, Infinity);
const readQueue = new Queue(50, Infinity);

function write (installationId, op) {
  return writeQueue.add(() => {
    return Promise.delay(1000)
      .then(() => getInstallationToken(installationId))
      .then(({token}) => {
        const github = Github();
        github.authenticate({ type: 'token', token });
        return op(github);
      })
      .then(response => response.data);
  });
}

function read (installationId, op) {
  return readQueue.add(() => {
    return getInstallationToken(installationId)
      .then(({token}) => {
        const github = Github();
        github.authenticate({ type: 'token', token });
        return op(github);
      })
      .then(response => response.data);
  });
}

module.exports = function (installationId) {
  return {
    write: write.bind(null, installationId),
    read: read.bind(null, installationId)
  };
};
