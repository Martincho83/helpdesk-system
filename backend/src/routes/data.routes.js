const express = require('express');
const router = express.Router();
const controller = require('../controllers/data.controller');
const { authJwt } = require('../middleware');

// Todas estas rutas son para usuarios autenticados
router.use(authJwt.verifyToken);

router.get('/ticket-statuses', controller.getTicketStatuses);
router.get('/ticket-categories', controller.getTicketCategories);
router.get('/admins', [authJwt.isAdmin], controller.getAdmins); // Solo admin puede ver la lista de admins

module.exports = router;