'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    isAccountActive: DataTypes.BOOLEAN,
    mailActivationToken: DataTypes.STRING,
    passwordRecoveryToken: DataTypes.STRING,
    expirePasswordRecovery: DataTypes.DATE,
    isRecoveryTokenUsed: DataTypes.BOOLEAN
  }, {
    tableName: 'users'
  });
  User.associate = function(models) {
    // User hasMany Articles
    User.hasMany(models.Article, { foreignKey: 'author' });
  };
  return User;
};