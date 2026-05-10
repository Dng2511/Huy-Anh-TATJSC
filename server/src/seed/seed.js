const connectDB = require('../config/database');
const mongoose = require('mongoose');

const Gate = require('../models/Gate');
const Partner = require('../models/Partner');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Order = require('../models/Order');

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const N_GATES = 6;
const N_PARTNERS = 4;
const N_DRIVERS = 8;
const N_VEHICLES = 6;
const N_ORDERS = 12;

async function seed() {
  const conn = await connectDB();

  try {
    // Clear existing data
    await Promise.all([
      Gate.deleteMany(),
      Partner.deleteMany(),
      Driver.deleteMany(),
      Vehicle.deleteMany(),
      Order.deleteMany(),
    ]);

    // Create gates
    const gateNames = [
      'Cửa khẩu Hữu Nghị',
      'Cửa khẩu Tân Thanh',
      'Cửa khẩu Lào Cai',
      'Cửa khẩu Móng Cái',
      'Cửa khẩu Cầu Treo',
      'Cửa khẩu Lao Bảo'
    ];

    const gatesData = [];
    for (let i = 0; i < N_GATES; i++) {
      gatesData.push({
        name: gateNames[i] || `Gate ${i + 1}`,
        location: `${sample(['District 1','District 2','Industrial Park','Seaport'])}`,
        locate: { lat: 10 + Math.random(), lng: 106 + Math.random() },
      });
    }

    const gates = await Gate.insertMany(gatesData);

    // Create partners
    const partners = [];
    for (let i = 0; i < N_PARTNERS; i++) {
      const pickup = sample(gates)._id;
      let delivery = sample(gates)._id;
      while (delivery.equals(pickup)) delivery = sample(gates)._id;

      partners.push({
        name: `Partner ${i + 1}`,
        contact: {
          phone: `+8490${randInt(1000000, 9999999)}`,
          email: `partner${i + 1}@example.com`,
        },
        rates: [
          {
            pickup,
            delivery,
            isReefer: Math.random() < 0.3,
            fixedCost: randInt(100, 1000),
          },
        ],
        waitingCost: randInt(0, 200),
      });
    }

    const createdPartners = await Partner.insertMany(partners);

    // Create drivers
    const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Bùi', 'Đỗ'];
    const lastNames = ['Anh', 'Bình', 'Chí', 'Dũng', 'Huy', 'Khánh', 'Linh', 'Minh'];

    const driversData = [];
    for (let i = 0; i < N_DRIVERS; i++) {
      const name = `${sample(firstNames)} ${sample(lastNames)}`;
      driversData.push({
        name,
        phone: `+8491${randInt(1000000, 9999999)}`,
        licenseNumber: `L${randInt(100000, 999999)}`,
        status: sample(['available', 'on_trip', 'off']),
      });
    }

    const createdDrivers = await Driver.insertMany(driversData);

    // Create vehicles and optionally assign drivers
    const vehiclesData = [];
    for (let i = 0; i < N_VEHICLES; i++) {
      const plate = `29A-${randInt(1000, 9999)}`;
      const assignedDriver = Math.random() < 0.7 ? sample(createdDrivers)._id : null;
      vehiclesData.push({
        licensePlate: plate,
        driver: assignedDriver,
        fuelRate: +(Math.random() * 10 + 5).toFixed(2),
        status: sample(['idle', 'running', 'maintenance']),
      });
    }

    const createdVehicles = await Vehicle.insertMany(vehiclesData);

    // Create orders linking partner, driver, vehicle, and gates
    const orderStatuses = ['planned', 'running', 'waiting', 'delivering', 'completed', 'cancelled'];
    const ordersData = [];

    for (let i = 0; i < N_ORDERS; i++) {
      const pickupGate = sample(gates)._id;
      let deliveryGate = sample(gates)._id;
      while (deliveryGate.equals(pickupGate)) deliveryGate = sample(gates)._id;

      const partner = sample(createdPartners)._id;
      const vehicleObj = Math.random() < 0.9 ? sample(createdVehicles) : null;
      const driverObj = vehicleObj && vehicleObj.driver ? null : (Math.random() < 0.6 ? sample(createdDrivers) : null);

      ordersData.push({
        partner,
        driver: driverObj ? driverObj._id : (vehicleObj ? vehicleObj.driver : null),
        vehicle: vehicleObj ? vehicleObj._id : null,
        pickup: pickupGate,
        delivery: deliveryGate,
        isReefer: Math.random() < 0.2,
        status: sample(orderStatuses),
        cost: randInt(200, 2000),
        waitingCost: randInt(0, 200),
      });
    }

    const createdOrders = await Order.insertMany(ordersData);

    console.log('Seed complete:');
    console.log(`  Gates: ${gates.length}`);
    console.log(`  Partners: ${createdPartners.length}`);
    console.log(`  Drivers: ${createdDrivers.length}`);
    console.log(`  Vehicles: ${createdVehicles.length}`);
    console.log(`  Orders: ${createdOrders.length}`);

    await conn.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();
