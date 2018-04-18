const app = require('../src/app');
// setup has to be called so services run their setup funtions
app.setup();
const github = app.get('github');

const setup = require('./setup');
const getRepo = require('./utils/get-repo');

async function doStuff() {
  const repository = await getRepo({
    github,
    installationId: 131495,
    repoId: 130156042
  });

  return setup(app, {
    installationId: 131495,
    repository
  });
}

doStuff().then(() => {
  console.log('Finished!');
  process.exit(0);
}).catch(e => {
  console.error('Error!', e);
  process.exit(1);
});
