'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('watches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      repoId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      target: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.ENUM('release', 'commit', 'tag', 'file'),
        defaultValue: 'release'
      },
      lastUpdatedAt: {
        type: Sequelize.DATE
      },
      lastUpdate: {
        type: Sequelize.STRING
      },
      lastCheckedAt: {
        type: Sequelize.DATE
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('watches');
  }
};
