const express = require('express');
const router = express.Router();
const PaisesController = require('../controllers/PaisesController');

router.get('/', PaisesController.getAll);
router.post('/', PaisesController.create);
router.put('/:id', PaisesController.update);   // Para Editar
router.delete('/:id', PaisesController.destroy); // Para Eliminar

module.exports = router;