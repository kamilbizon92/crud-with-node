'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'users',
      'passwordRecoveryToken',
      {
        type: Sequelize.STRING,
        unique: true
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'users',
      'passwordRecoveryToken'
    );
  }
};
