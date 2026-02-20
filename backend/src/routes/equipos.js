const express = require('express');
const router = express.Router();
const EquiposController = require('../controllers/EquiposController');

// Obtener todos los equipos (Para la lista)
router.get('/', EquiposController.getAll);

// NUEVO: Obtener un solo equipo por ID (Para el Perfil/Detalle)
// Esta es la ruta que tu componente EquipoPerfil.vue está buscando
router.get('/:id', EquiposController.getById); 

// Rutas de gestión
router.post('/', EquiposController.create);
router.put('/:id', EquiposController.update);
router.delete('/:id', EquiposController.destroy);

module.exports = router;