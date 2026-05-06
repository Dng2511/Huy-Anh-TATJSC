const Driver = require('../models/Driver');

// Create a new driver
exports.createDriver = async (req, res) => {
  try {
    const { id, name, phone, licenseNumber, status } = req.body;

    const existingDriver = await Driver.findOne({
      $or: [{ id }, { licenseNumber }],
    });

    if (existingDriver) {
      return res.status(400).json({
        error: 'Driver with this ID or license number already exists',
      });
    }

    const driver = new Driver({
      id,
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
    const drivers = await Driver.find();
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single driver by ID
exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findOne({ id: req.params.id });

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
    const { id, name, phone, licenseNumber, status } = req.body;

    const driver = await Driver.findOneAndUpdate(
      { id: req.params.id },
      { id, name, phone, licenseNumber, status },
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

// Delete a driver
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findOneAndDelete({ id: req.params.id });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.status(200).json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
