const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Order = require('../models/Order');

async function resolveDocumentId(Model, businessId) {
  if (!businessId) {
    return null;
  }

  const document = await Model.findOne({ id: businessId });
  return document ? document._id : null;
}

// Create a new trip
exports.createTrip = async (req, res) => {
  try {
    const { id, vehicleId, driverId, order1Id, order2Id, route, status, cost } = req.body;

    // Validate references
    const vehicleObjectId = await resolveDocumentId(Vehicle, vehicleId);
    if (!vehicleObjectId) {
      return res.status(400).json({ error: 'Vehicle not found' });
    }

    const driverObjectId = await resolveDocumentId(Driver, driverId);
    if (!driverObjectId) {
      return res.status(400).json({ error: 'Driver not found' });
    }

    const order1ObjectId = await resolveDocumentId(Order, order1Id);
    if (!order1ObjectId) {
      return res.status(400).json({ error: 'Order 1 not found' });
    }

    let order2ObjectId = null;
    if (order2Id) {
      order2ObjectId = await resolveDocumentId(Order, order2Id);
      if (!order2ObjectId) {
        return res.status(400).json({ error: 'Order 2 not found' });
      }
    }

    const existingTrip = await Trip.findOne({ id });
    if (existingTrip) {
      return res.status(400).json({ error: 'Trip with this ID already exists' });
    }

    const trip = new Trip({
      id,
      vehicleId: vehicleObjectId,
      driverId: driverObjectId,
      order1Id: order1ObjectId,
      order2Id: order2ObjectId,
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
    const trips = await Trip.find().populate('vehicleId driverId order1Id order2Id');
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single trip by ID
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ id: req.params.id }).populate('vehicleId driverId order1Id order2Id');

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
    let vehicleObjectId;
    if (vehicleId) {
      vehicleObjectId = await resolveDocumentId(Vehicle, vehicleId);
      if (!vehicleObjectId) {
        return res.status(400).json({ error: 'Vehicle not found' });
      }
    }

    let driverObjectId;
    if (driverId) {
      driverObjectId = await resolveDocumentId(Driver, driverId);
      if (!driverObjectId) {
        return res.status(400).json({ error: 'Driver not found' });
      }
    }

    let order1ObjectId;
    if (order1Id) {
      order1ObjectId = await resolveDocumentId(Order, order1Id);
      if (!order1ObjectId) {
        return res.status(400).json({ error: 'Order 1 not found' });
      }
    }

    let order2ObjectId = null;
    if (order2Id) {
      order2ObjectId = await resolveDocumentId(Order, order2Id);
      if (!order2ObjectId) {
        return res.status(400).json({ error: 'Order 2 not found' });
      }
    }

    const updatePayload = { id, route, status, cost };
    if (vehicleObjectId) {
      updatePayload.vehicleId = vehicleObjectId;
    }
    if (driverObjectId) {
      updatePayload.driverId = driverObjectId;
    }
    if (order1ObjectId) {
      updatePayload.order1Id = order1ObjectId;
    }
    if (order2Id !== undefined) {
      updatePayload.order2Id = order2ObjectId;
    }

    const trip = await Trip.findOneAndUpdate(
      { id: req.params.id },
      updatePayload,
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
    const vehicleObjectId = await resolveDocumentId(Vehicle, req.params.vehicleId);
    const trips = vehicleObjectId
      ? await Trip.find({ vehicleId: vehicleObjectId }).populate('vehicleId driverId order1Id order2Id')
      : [];
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get trips by driver ID
exports.getTripsByDriver = async (req, res) => {
  try {
    const driverObjectId = await resolveDocumentId(Driver, req.params.driverId);
    const trips = driverObjectId
      ? await Trip.find({ driverId: driverObjectId }).populate('vehicleId driverId order1Id order2Id')
      : [];
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
