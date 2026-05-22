const axios = require('axios');
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
    const vehicles = await Vehicle.find().populate('driver', 'name');

    const response = await axios.post(
      'https://dvbk.vn/Home/get_AllTIBase',
      {
        UserID: 1106,
      }
    );

    const trackingData = response.data;

    // tạo map tracking
    const trackingMap = {};

    trackingData.forEach((item) => {
      trackingMap[item.NormalizedPlate] = item;
    });

    // nối dữ liệu
    const result = vehicles.map((vehicle) => {
      const tracking =
        trackingMap[vehicle.licensePlate];

      return {
        ...vehicle.toObject(),

        tracking: tracking
          ? {
            lat: tracking.Lt,
            lng: tracking.Ln,
            speed: tracking.Speed,
            address: tracking.Address,
            driverName:
              tracking.DriverName,
            liveStatus:
              tracking.Speed > 0
                ? `${tracking.Speed} km/h`
                : `Đỗ ${tracking.StopOrParkTime}`,

            updatedAt:
              tracking.Date,
            image: tracking.ImageLink,
          }
          : null,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

function normalizePlate(plate) {
  return plate
    ?.toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

// Get a single vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ id: req.params.id }).populate('driver', 'name');

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
    const { licensePlate, fuelRate, status, driver } = req.body;

    const update = {};
    if (typeof licensePlate !== 'undefined') update.licensePlate = licensePlate;
    if (typeof fuelRate !== 'undefined') update.fuelRate = fuelRate;
    if (typeof status !== 'undefined') update.status = status;
    if (typeof driver !== 'undefined') update.driver = driver;

    const currentVehicle = await Vehicle.findById(req.params.id);

    if (!currentVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (typeof id !== 'undefined') update.id = id;
    if (typeof licensePlate !== 'undefined') update.licensePlate = licensePlate;
    if (typeof fuelRate !== 'undefined') update.fuelRate = fuelRate;
    if (typeof status !== 'undefined') update.status = status;

    if (typeof driver !== 'undefined') {

      const oldDriver = currentVehicle.driver;

      const anotherVehicle = await Vehicle.findOne({
        driver,
        _id: { $ne: currentVehicle._id },
      });

      if (anotherVehicle) {
        anotherVehicle.driver = oldDriver || null;
        await anotherVehicle.save();
      }

      update.driver = driver;
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      currentVehicle._id,
      update,
      {
        new: true,
        runValidators: true,
      }
    );

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
