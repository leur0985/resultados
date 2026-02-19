const express = require('express');
const router = express.Router();
const ArbitrosController = require('../controllers/ArbitrosController');

// Definimos que cuando alguien entre a la raíz de este archivo (/) 
// con el método GET, se ejecute la función getAll del controlador.
router.get('/', ArbitrosController.getAll);
router.post('/', ArbitrosController.create);
router.put('/:id', ArbitrosController.update);   // Para Editar
router.delete('/:id', ArbitrosController.destroy); // Para Eliminar


module.exports = router; // Sin esto, app.js importa un objeto vacío