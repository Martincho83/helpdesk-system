'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.Ticket, { foreignKey: 'ticketId', as: 'ticket' });
      Comment.belongsTo(models.User, { foreignKey: 'userId', as: 'author' });
    }
  }
  Comment.init({
    content: { type: DataTypes.TEXT, allowNull: false }
  }, { sequelize, modelName: 'Comment' });
  return Comment;
};