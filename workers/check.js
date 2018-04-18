// TODO: rewrite with new github.getOctokit
const octokit = require('@octokit/rest')();
const parseGitHubUrl = require('parse-github-url');
const isAfter = require('date-fns/is_after');
const app = require('../src/app');
// setup has to be called so services run their setup funtions
app.setup();
const watchesService = app.service('watches');
const releaseQueueService = app.service('release-queue');
const checkInterval = app.get('checkInterval');

function findWatchesToCheck() {
  return watchesService.find({
    query: {
      $or: [
        {
          lastCheckedAt: {
            $lt: new Date(new Date().getTime() - checkInterval)
          }
        },
        {
          lastCheckedAt: null
        }
      ],
      $limit: -1,
      active: true
    },
  });
}

async function getLatestRelease(watch) {
  const { owner, name } = parseGitHubUrl(watch.releaseRepo);
  let latestRelease = null;
  try {
    const result = await octokit.repos.getLatestRelease({owner, repo: name});
    latestRelease = result.data;
  } catch(e) {
    console.log(`[${watch.repo}] ERROR finding latest release for '${watch.releaseRepo}': ${e.code} ${e.message}`);
  }
  return latestRelease;
}

function updateWatch(watch, update) {
  return watchesService.patch(watch.id, update);
}

function scheduleReleaseJob(watch, release) {
  console.log(`[${watch.repo}] Scheduling release job for latest release from ${watch.releaseRepo}`);
  return releaseQueueService.create({
    watch, release
  });
}

function processRelease(watch, latestRelease) {
  let promise = Promise.resolve();
  if(latestRelease !== null) {
    console.log(`[${watch.repo}] Latest release for '${watch.releaseRepo}' is tagged ${latestRelease.tag_name} published on ${latestRelease.published_at}`);
    if(isAfter(latestRelease.published_at, watch.lastReleasedAt)) {
      console.log(`[${watch.repo}] Release for ${watch.releaseRepo} needs to be processed`);
      promise = scheduleReleaseJob(watch, latestRelease);
    } else {
      console.log(`[${watch.repo}] Release for ${watch.releaseRepo} is current`);
    }
  }
  return promise;
}

async function checkWatch(watch) {
  console.log(`[${watch.repo}] Checking...`);
  const latestRelease = await getLatestRelease(watch);
  const prcessingPromise = processRelease(watch, latestRelease);
  const updatePromise = updateWatch(watch, {
    lastCheckedAt: new Date().getTime()
  });

  return Promise.all([prcessingPromise, updatePromise]);
}

async function checkWatches() {
  console.log('Starting check script');
  const watchesToCheck = await findWatchesToCheck();
  console.log(`${watchesToCheck.length} watches to check`);
  return Promise.all(watchesToCheck.map(checkWatch));
}

checkWatches().then(() => {
  console.log('Finished!');
  process.exit(0);
});
