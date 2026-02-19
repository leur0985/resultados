const express = require('express');
const router = express.Router();
const TorneosController = require('../controllers/TorneosController');

// 1. Obtener todos los torneos
router.get('/', TorneosController.getAll);

// 2. ADMINISTRACIÓN DE EQUIPOS (Panel Teams)
router.post('/add-equipo', TorneosController.addEquipo);
router.delete('/remove-equipo/:id', TorneosController.removeEquipo);

// 3. OBTENER PARTIDOS DE UN TORNEO (La que te falta para la vista de partidos)
// Esta ruta resuelve el error 404 en TorneoPartidosView.vue
router.get('/:torneo_id/partidos', TorneosController.getPartidosByTorneo);

// 4. Detalle de un torneo (ID al final para no chocar con las anteriores)
router.get('/:id', TorneosController.getById);

router.get('/:torneo_id/tabla', TorneosController.getTablaGeneral);

// 5. CRUD Básico
router.post('/', TorneosController.create);
router.put('/:id', TorneosController.update);
router.delete('/:id', TorneosController.destroy);

module.exports = router;