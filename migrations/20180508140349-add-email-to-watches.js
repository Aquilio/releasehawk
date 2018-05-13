'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'watches',
      'email',
      {
        type: Sequelize.STRING,
        allowNull: true
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('watched', 'email');
  }
};
