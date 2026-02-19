const express = require('express');
const router = express.Router();
const TecnicosController = require('../controllers/TecnicosController');

router.get('/', TecnicosController.getAll);

module.exports = router;