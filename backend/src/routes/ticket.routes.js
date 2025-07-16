console.log("--- CARGANDO ticket.routes.js VERSIÓN NUEVA ---");

const express = require('express');
const router = express.Router();
const controller = require('../controllers/ticket.controller');
const { authJwt } = require('../middleware');

// Todas las rutas de tickets requieren que el usuario esté autenticado.
router.use(authJwt.verifyToken);

// Rutas
router.post('/', controller.createTicket);
router.get('/', controller.getTickets);

router.get('/:id', controller.getTicketById);
router.post('/:id/comments', controller.addComment);
router.put('/:id', express.json(), [authJwt.isAdmin], controller.updateTicket);

module.exports = router;
