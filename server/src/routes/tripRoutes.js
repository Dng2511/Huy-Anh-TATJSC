const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { validateTrip } = require('../middleware/validation');

// CRUD endpoints for trips
router.post('/', validateTrip, tripController.createTrip);
router.get('/', tripController.getAllTrips);
router.get('/vehicle/:vehicleId', tripController.getTripsByVehicle);
router.get('/driver/:driverId', tripController.getTripsByDriver);
router.get('/:id', tripController.getTripById);
router.put('/:id', validateTrip, tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);

module.exports = router;
