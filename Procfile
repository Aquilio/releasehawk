web: yarn start
check: node jobs/check.js
setup: QUEUE=setup node queue
finalize: QUEUE=finalize node queue
release: yarn run sequelize db:migrate
