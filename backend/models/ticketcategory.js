'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TicketCategory extends Model {
    static associate(models) {
      TicketCategory.hasMany(models.Ticket, { foreignKey: 'categoryId', as: 'tickets' });
    }
  }
  TicketCategory.init({
    name: { type: DataTypes.STRING, allowNull: false, unique: true }
  }, { sequelize, modelName: 'TicketCategory' });
  return TicketCategory;
};