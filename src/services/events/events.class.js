/* eslint-disable no-unused-vars */
const errors = require('@feathersjs/errors');

class Service {
  constructor (options) {
    this.options = options || {};
  }

  setup (app) {
    this.app = app;
  }

  async processAddedRepositories (installationId, repositories) {
    const setupQueue = this.app.service('setup-queue');
    const reposService = this.app.service('repos');


    return Promise.all(repositories.map(async (repo) => {
      const repoResult = await reposService.find({
        query: {
          installationId,
          githubId: repo.id
        }
      });
      if(repoResult.total === 0) {
        return setupQueue.create({installationId, repository: repo});
      }
      return Promise.resolve();
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
    /**
     * New repos added or removed
     * If added, create a setup job for each repo
     * If removed, remove the repos and watches
     */
    case 'installation_repositories':
      if(data.action === 'added') {
        promise = this.processAddedRepositories(data.installation.id, data.repositories_added);
      } else if(data.action === 'removed') {
        promise = this.processRemovedRepositories(data.installation.id, data.repositories_removed);
      }
      break;
    /**
     * PR Merged
     * Start the finalize process for the repo
     */
    case 'pull_request':
      if(data.action === 'closed' && data.pull_request.merged) {
        promise = this.finalizeRepo(data.installation.id, data.number, data.repository);
      }
      break;
    /**
     * Issue closed
     * Restart the setup process for the repo.
     */
    case 'issues':
      if(data.action === 'closed') {
        promise = this.processAddedRepositories(data.installation.id, [data.repository]);
      }
      break;
    /**
     * New (un)installation
     * If this is a new install, create a setup job for each repo
     * If this is a uninstall, remove the repo and all watches
     */
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
