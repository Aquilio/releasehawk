/* eslint-disable no-unused-vars */
const errors = require('@feathersjs/errors');

class Service {
  constructor (options) {
    this.options = options || {};
  }

  setup (app) {
    this.app = app;
  }

  processAddedRepositories (installationId, repositories) {
    const setupQueue = this.app.service('setup-queue');
    return Promise.all(repositories.map(repo => {
      return setupQueue.create({installationId, repository: repo});
    }));
  }

  processRemovedRepositories (installationId, repositories) {
    const reposService = this.app.service('repos');
    return Promise.all(repositories.map(repo => {
      return new Promise((resolve, reject) => {
        reposService.remove(null, {
          query: {
            installationId,
            githubId: repo.id
          }
        }).then(resolve).catch(e => {
          // Ok if repo wasn't there
          if(e.code === 404) {
            resolve('repo does not exist');
          }
          reject(e);
        });
      });
    }));
  }

  processUninstall (installationId) {
    const reposService = this.app.service('repos');
    return reposService.remove(null, {
      query: {
        installationId
      }
    });
  }

  async finalizeRepo (installationId, prNumber, repository) {
    debugger
    const reposService = this.app.service('repos');
    const finalizeQueue = this.app.service('finalize-queue');

    const repoResult = await reposService.find({
      query: {
        installationId,
        githubId: repository.id
      }
    });

    if(repoResult.total === 0) {
      return Promise.resolve(`repo with installationId ${installationId} and id ${repository.id} not found`);
    }
    const repo = repoResult.data[0];
    if(repo && repo.setupId === prNumber) {
      return finalizeQueue.create({installationId, repository});
    }
    return Promise.resolve('PR was not the setup PR');
  }

  async create (data, params) {
    const github = this.app.get('github');
    const eventType = params.headers['x-github-event'];
    let promise = Promise.resolve('Event ignored');
    switch(eventType) {
    // Add issue close to listen for resolved issues found during setup
    case 'installation_repositories':
      if(data.action === 'added') {
        promise = this.processAddedRepositories(data.installation.id, data.repositories_added);
      } else if(data.action === 'removed') {
        promise = this.processRemovedRepositories(data.installation.id, data.repositories_removed);
      }
      break;
    case 'pull_request':
      if(data.action === 'closed' && data.pull_request.merged) {
        promise = this.finalizeRepo(data.installation.id, data.number, data.repository);
      }
      break;
    case 'installation':
      if(data.action === 'created') {
        promise = this.processAddedRepositories(data.installation.id, data.repositories);
      } else if(data.action === 'deleted') {
        promise = this.processUninstall(data.installation.id);
      }
      break;
    default:
      break;
    }

    return promise;
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
