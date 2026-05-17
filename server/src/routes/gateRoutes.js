const express = require('express');
const router = express.Router();
const gateController = require('../controllers/gateController');
const { validateGate } = require('../middleware/validation');
const { checkUser } = require('../middleware/checkUser');
// CRUD endpoints for gates
router.post('/', checkUser, validateGate, gateController.createGate);
router.get('/', gateController.getAllGates);
router.put('/:id', checkUser, validateGate, gateController.updateGate);
router.delete('/', checkUser, gateController.deleteGates);

module.exports = router;