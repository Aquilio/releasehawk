web: npm start
setup: QUEUE=setup node queue
finalize: QUEUE=finalize node queue
update: QUEUE=update node queue
release: npm run sequelize db:migrate && cd public && npm run build
