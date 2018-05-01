module.exports = function updateOrCreateRepo({
  service, repoEntry, pr, issue, repo, owner, githubId, installationId
}) {
  let data = {};
  if(pr) {
    data.setupId = pr.number;
  }
  if(issue) {
    data.issueId = issue.number;
  }
  if(repoEntry) {
    return service.patch(repoEntry.id, data);
  } else {
    data = Object.assign({}, data, {
      repo,
      owner,
      githubId,
      installationId,
      active: false
    });
    return service.create(data);
  }
};
