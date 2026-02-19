const express = require('express');
const router = express.Router();
const EquiposController = require('../controllers/EquiposController');

router.get('/', EquiposController.getAll);
router.post('/', EquiposController.create);
router.put('/:id', EquiposController.update);
router.delete('/:id', EquiposController.destroy);

module.exports = router;