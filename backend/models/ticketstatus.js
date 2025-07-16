'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TicketStatus extends Model {
    static associate(models) {
      TicketStatus.hasMany(models.Ticket, { foreignKey: 'statusId', as: 'tickets' });
    }
  }
  TicketStatus.init({
    name: { type: DataTypes.STRING, allowNull: false, unique: true }
  }, { sequelize, modelName: 'TicketStatus' });
  return TicketStatus;
};