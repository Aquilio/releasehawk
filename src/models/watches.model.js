const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const watches = sequelizeClient.define('watches', {
    repoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    target: {
      type: DataTypes.STRING
    },
    type: {
      type: DataTypes.ENUM('release', 'commit', 'tag'),
      defaultValue: 'release'
    },
    lastUpdate: {
      type: DataTypes.STRING
    },
    lastUpdatedAt: {
      type: DataTypes.DATE
    },
    lastCheckedAt: {
      type: DataTypes.DATE,
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
  watches.associate = function (models) {
    watches.belongsTo(models.repos);
  };

  return watches;
};
