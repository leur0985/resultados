const express = require('express');
const router = express.Router();
const PaisesController = require('../controllers/PaisesController');
const EstadiosController = require('../controllers/EstadiosController');

router.get('/', EstadiosController.getAll);
router.post('/', EstadiosController.create);
router.put('/:id', EstadiosController.update);   // Para Editar
router.delete('/:id', EstadiosController.destroy); // Para Eliminar
module.exports = router;