const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { validateVehicle } = require('../middleware/validation');

// CRUD endpoints for vehicles
router.post('/', validateVehicle, vehicleController.createVehicle);
router.get('/', vehicleController.getAllVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.put('/:id', validateVehicle, vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router;
