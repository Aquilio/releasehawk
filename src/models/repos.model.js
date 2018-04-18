// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const repos = sequelizeClient.define('repos', {
    repo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    owner: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    githubId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    installationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    setupId: {
      type: DataTypes.INTEGER
    },
    issueId: {
      type: DataTypes.INTEGER
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  repos.associate = function (models) {
    repos.hasMany(models.watches, {
      foreignKey: 'repoId',
      as: 'watches',
    });
  };

  return repos;
};
