const express = require('express');
const router = express.Router();
const gateController = require('../controllers/gateController');
const { validateGate } = require('../middleware/validation');
// CRUD endpoints for gates
router.post('/', validateGate, gateController.createGate);
router.get('/', gateController.getAllGates);
router.put('/:id', validateGate, gateController.updateGate);
router.delete('/', gateController.deleteGates);

module.exports = router;