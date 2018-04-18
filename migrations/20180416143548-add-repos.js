'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('repos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      repo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      owner: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      githubId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      installationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      setupId: {
        type: Sequelize.INTEGER
      },
      issueId: {
        type: Sequelize.INTEGER
      },
      active: {
        type: Sequelize.BOOLEAN
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
    return queryInterface.dropTable('repos');
  }
};
