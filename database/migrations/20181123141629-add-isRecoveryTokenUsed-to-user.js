'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'users',
      'isRecoveryTokenUsed',
      {
        type: Sequelize.BOOLEAN
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'users',
      'isRecoveryTokenUsed'
    );
  }
};
