const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { validateDriver } = require('../middleware/validation');
const { checkUser } = require('../middleware/checkUser');

// CRUD endpoints for drivers
router.post('/', checkUser, validateDriver, driverController.createDriver);
router.get('/', driverController.getAllDrivers);
router.get('/:id', driverController.getDriverById);
router.put('/:id', checkUser, validateDriver, driverController.updateDriver);
router.delete('/', checkUser, driverController.deleteDrivers);

module.exports = router;
