const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { validateDriver } = require('../middleware/validation');

// CRUD endpoints for drivers
router.post('/', validateDriver, driverController.createDriver);
router.get('/', driverController.getAllDrivers);
router.get('/:id', driverController.getDriverById);
router.put('/:id', validateDriver, driverController.updateDriver);
router.delete('/:id', driverController.deleteDriver);

module.exports = router;
