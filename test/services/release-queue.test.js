const assert = require('assert');
const app = require('../../src/app');

describe('\'events\' service', () => {
  it('registered the service', () => {
    const service = app.service('release-queue');

    assert.ok(service, 'Registered the service');
  });
});
