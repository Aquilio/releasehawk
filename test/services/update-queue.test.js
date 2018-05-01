const assert = require('assert');
const app = require('../../src/app');

describe('\'update-queue\' service', () => {
  it('registered the service', () => {
    const service = app.service('release-queue');

    assert.ok(service, 'Registered the service');
  });
});
