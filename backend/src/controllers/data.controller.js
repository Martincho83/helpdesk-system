const db = require('../../models');
const { User, TicketCategory, TicketStatus } = db;

// Obtener lista de todos los estados de ticket
exports.getTicketStatuses = async (req, res) => {
  const statuses = await TicketStatus.findAll();
  res.status(200).send(statuses);
};

// Obtener lista de todas las categorías de ticket
exports.getTicketCategories = async (req, res) => {
  const categories = await TicketCategory.findAll();
  res.status(200).send(categories);
};

// Obtener lista de usuarios que son administradores
exports.getAdmins = async (req, res) => {
  const admins = await User.findAll({
    where: { role: 'admin' },
    attributes: ['id', 'name']
  });
  res.status(200).send(admins);
};