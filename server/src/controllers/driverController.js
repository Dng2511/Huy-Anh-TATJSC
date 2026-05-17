const Driver = require('../models/Driver');

// Create a new driver
exports.createDriver = async (req, res) => {
  try {
    const {name, phone, licenseNumber, status } = req.body;

    const existingDriver = await Driver.findOne({
      licenseNumber
    });

    if (existingDriver) {
      return res.status(400).json({
        error: 'Driver with this license number already exists',
      });
    }

    const driver = new Driver({
      name,
      phone,
      licenseNumber,
      status,
    });

    await driver.save();
    res.status(201).json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all drivers
exports.getAllDrivers = async (req, res) => {
  try {
    const filters = {};
    if (req.query.name) {
      filters.name = { $regex: req.query.name, $options: 'i' };
    }
    if (req.query.status) {
      const statuses = req.query.status.split(',');

      filters.status = {
        $in: statuses,
      };
    }
    const drivers = await Driver.find(filters).sort({ createdAt: -1 });
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single driver by ID
exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findOne({ _id: req.params.id });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.status(200).json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a driver
exports.updateDriver = async (req, res) => {
  try {
    const {name, phone, licenseNumber, status } = req.body;

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { name, phone, licenseNumber, status },
      { new: true, runValidators: true }
    );

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.status(200).json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete drivers (multiple)
exports.deleteDrivers = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        error: 'ids must be an array'
      });
    }

    const result = await Driver.deleteMany({
      _id: { $in: ids }
    });

    res.status(200).json({
      message: 'Drivers deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};
