const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { validateVehicle } = require('../middleware/validation');
const { checkUser } = require('../middleware/checkUser');

// CRUD endpoints for vehicles
router.post('/', checkUser, validateVehicle, vehicleController.createVehicle);
router.get('/', vehicleController.getAllVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.put('/:id', checkUser, validateVehicle, vehicleController.updateVehicle);
router.delete('/', checkUser, vehicleController.deleteVehicles);
module.exports = router;
