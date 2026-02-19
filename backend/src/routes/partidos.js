const express = require('express');
const router = express.Router();
const PartidosController = require('../controllers/PartidosController');

router.get('/evolucion-completa/:torneo_id', PartidosController.getEvolucionCompleta);
// 1. Historial H2H (Filtrado por query params)
router.get('/h2h', PartidosController.getH2H);

// 2. Historial Global (Todos los partidos)
router.get('/', PartidosController.getAll);

// 3. Por Torneo específico
router.get('/torneo/:torneo_id', PartidosController.getByTorneo);

// CRUD
router.post('/', PartidosController.create);
router.put('/:id', PartidosController.update);
router.delete('/:id', PartidosController.destroy);


module.exports = router;