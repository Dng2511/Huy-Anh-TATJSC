const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Order = require('../models/Order');

// Create a new trip
exports.createTrip = async (req, res) => {
  try {
    const { id, vehicleId, driverId, order1Id, order2Id, route, status, cost } = req.body;

    // Validate references
    const vehicle = await Vehicle.findOne({ id: vehicleId });
    if (!vehicle) {
      return res.status(400).json({ error: 'Vehicle not found' });
    }

    const driver = await Driver.findOne({ id: driverId });
    if (!driver) {
      return res.status(400).json({ error: 'Driver not found' });
    }

    const order1 = await Order.findOne({ id: order1Id });
    if (!order1) {
      return res.status(400).json({ error: 'Order 1 not found' });
    }

    if (order2Id) {
      const order2 = await Order.findOne({ id: order2Id });
      if (!order2) {
        return res.status(400).json({ error: 'Order 2 not found' });
      }
    }

    const existingTrip = await Trip.findOne({ id });
    if (existingTrip) {
      return res.status(400).json({ error: 'Trip with this ID already exists' });
    }

    const trip = new Trip({
      id,
      vehicleId,
      driverId,
      order1Id,
      order2Id,
      route,
      status,
      cost,
    });

    await trip.save();
    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all trips
exports.getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find();
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single trip by ID
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ id: req.params.id });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a trip
exports.updateTrip = async (req, res) => {
  try {
    const { id, vehicleId, driverId, order1Id, order2Id, route, status, cost } = req.body;

    // Validate references if they are being updated
    if (vehicleId) {
      const vehicle = await Vehicle.findOne({ id: vehicleId });
      if (!vehicle) {
        return res.status(400).json({ error: 'Vehicle not found' });
      }
    }

    if (driverId) {
      const driver = await Driver.findOne({ id: driverId });
      if (!driver) {
        return res.status(400).json({ error: 'Driver not found' });
      }
    }

    if (order1Id) {
      const order1 = await Order.findOne({ id: order1Id });
      if (!order1) {
        return res.status(400).json({ error: 'Order 1 not found' });
      }
    }

    if (order2Id) {
      const order2 = await Order.findOne({ id: order2Id });
      if (!order2) {
        return res.status(400).json({ error: 'Order 2 not found' });
      }
    }

    const trip = await Trip.findOneAndUpdate(
      { id: req.params.id },
      { id, vehicleId, driverId, order1Id, order2Id, route, status, cost },
      { new: true, runValidators: true }
    );

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.status(200).json(trip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a trip
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ id: req.params.id });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.status(200).json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get trips by vehicle ID
exports.getTripsByVehicle = async (req, res) => {
  try {
    const trips = await Trip.find({ vehicleId: req.params.vehicleId });
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get trips by driver ID
exports.getTripsByDriver = async (req, res) => {
  try {
    const trips = await Trip.find({ driverId: req.params.driverId });
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
