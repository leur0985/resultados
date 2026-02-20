const express = require('express');
const router = express.Router();
const TecnicosController = require('../controllers/TecnicosController');

// Rutas de Catálogo
router.get('/', TecnicosController.getAll);           // Listar todos
router.post('/', TecnicosController.create);          // Crear nuevo
router.put('/:id', TecnicosController.update);        // Editar existente
router.delete('/:id', TecnicosController.destroy);     // Eliminar

// Rutas de Relación (Equipo <-> Técnico)
router.post('/asignar', TecnicosController.asignarAEquipo);
// Opcional: Obtener historial de un equipo específico
router.get('/historial/:id', TecnicosController.getHistorialByEquipo); 
router.put('/historial/:id', TecnicosController.updateHistorial);
router.delete('/historial/:id', TecnicosController.destroyHistorial);

module.exports = router;