'use strict';
const {  Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Un usuario puede crear muchos tickets
      User.hasMany(models.Ticket, {
        foreignKey: 'creatorId',
        as: 'createdTickets',
      });
      // Un usuario puede ser asignado a muchos tickets
      User.hasMany(models.Ticket, {
        foreignKey: 'assigneeId',
        as: 'assignedTickets',
      });

      // Un usuario puede hacer muchos comentarios
      User.hasMany(models.Comment, {
        foreignKey: 'userId',
        as: 'comments',
      });
    }
  }
  
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'employee'),
      allowNull: false,
      defaultValue: 'employee'
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};