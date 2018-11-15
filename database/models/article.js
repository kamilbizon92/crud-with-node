'use strict';
module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define('Article', {
    title: DataTypes.STRING,
    author: DataTypes.INTEGER,
    body: DataTypes.TEXT
  }, {
    tableName: 'articles'
  });
  Article.associate = function(models) {
    // Article belongsTo User
    Article.belongsTo(models.User, { foreignKey: 'author' });
  };
  return Article;
};