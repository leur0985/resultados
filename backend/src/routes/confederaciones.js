const express = require('express');
const router = express.Router();
const ConfederacionesController = require('../controllers/ConfederacionesController');

// Definición de rutas limpias
router.get('/', ConfederacionesController.getAll);
router.post('/', ConfederacionesController.create);
router.put('/:id', ConfederacionesController.update);   // Para Editar
router.delete('/:id', ConfederacionesController.destroy); // Para Eliminar

module.exports = router;