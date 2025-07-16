'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    static associate(models) {
      Ticket.belongsTo(models.TicketStatus, { foreignKey: 'statusId', as: 'status' });
      Ticket.belongsTo(models.TicketCategory, { foreignKey: 'categoryId', as: 'category' });
      Ticket.belongsTo(models.User, { foreignKey: 'creatorId', as: 'creator' });
      Ticket.belongsTo(models.User, { foreignKey: 'assigneeId', as: 'assignee' });
      Ticket.hasMany(models.Comment, { foreignKey: 'ticketId', as: 'comments' });
    }
  }
  Ticket.init({
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false }
  }, { sequelize, modelName: 'Ticket' });
  return Ticket;
};