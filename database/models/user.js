'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    tableName: 'users'
  });
  User.associate = function(models) {
    // User hasMany Articles
    User.hasMany(models.Article, { foreignKey: 'author' });
  };
  return User;
};