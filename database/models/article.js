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
    // associations can be defined here
  };
  return Article;
};