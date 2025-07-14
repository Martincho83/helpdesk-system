const express = require('express');
const router = express.Router();
const { authJwt} = require('../middleware');
const controller = require('../controllers/user.controller');

router.get('/', [authJwt.verifyToken, authJwt.isAdmin], controller.getAllUsers);

module.exports = router;