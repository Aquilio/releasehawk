const assert = require('assert');
const app = require('../../src/app');

describe('\'repos\' service', () => {
  it('registered the service', () => {
    const service = app.service('repos');

    assert.ok(service, 'Registered the service');
  });
});
