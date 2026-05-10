const Vehicle = require('../models/Vehicle');

// Create a new vehicle
exports.createVehicle = async (req, res) => {
  try {
    const { id, licensePlate, fuelRate, status } = req.body;

    const existingVehicle = await Vehicle.findOne({
      $or: [{ id }, { licensePlate }],
    });

    if (existingVehicle) {
      return res.status(400).json({
        error: 'Vehicle with this ID or license plate already exists',
      });
    }

    const vehicle = new Vehicle({
      id,
      licensePlate,
      fuelRate,
      status,
    });

    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ id: req.params.id });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const orders = await Order.find({ vehicle: vehicle._id, status: { $in: ['running', 'planned'] } }).populate('pickup delivery');

    const vehicleData = vehicle.toObject();
    vehicleData.orders = orders;

    res.status(200).json(vehicleData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const { id, licensePlate, fuelRate, status } = req.body;

    const vehicle = await Vehicle.findOneAndUpdate(
      { id: req.params.id },
      { id, licensePlate, fuelRate, status },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }


    res.status(200).json(vehicle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a vehicle
exports.deleteVehicles = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        error: 'ids must be an array'
      });
    }

    const result = await Vehicle.deleteMany({
      _id: { $in: ids }
    });

    res.status(200).json({
      message: 'Vehicles deleted successfully',
      deletedCount: result.deletedCount
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};
