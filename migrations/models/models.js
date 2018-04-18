const Sequelize = require('sequelize');
const app = require('../../src/app');
const sequelize = app.get('sequelizeClient');
const models = sequelize.models;

module.exports = Object.assign({
  Sequelize,
  sequelize
}, models);
