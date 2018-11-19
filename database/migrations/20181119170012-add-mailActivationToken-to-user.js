'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'users',
      'mailActivationToken',
      {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'users',
      'mailActivationToken'
    );
  }
};
