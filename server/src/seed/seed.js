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
    const gatesData = [
      {
        name: 'Cửa khẩu Hữu Nghị',
        location: 'QL1A, Đồng Đăng, Lạng Sơn, Việt Nam',
        locate: {
          lat: 21.9706221,
          lng: 106.7111227
        }
      },
      {
        name: 'Cửa khẩu Móng Cái',
        location: 'GXP9+8WC, Đ. Đại lộ Hoà Bình, Móng Cái 1, Quảng Ninh, Việt Nam',
        locate: {
          lat: 21.5358091,
          lng: 107.9697573
        }
      },
      {
        name: 'Cửa khẩu Quốc tế Lào Cai',
        location: '1 Nguyễn Huệ, p, Lào Cai, Việt Nam',
        locate: {
          lat: 22.5065298,
          lng: 103.9658478
        }
      },
      {
        name: 'Cửa khẩu Trà Lĩnh',
        location: 'TL 205, Cửa khẩu Trà Lĩnh, TL 205, Trà Lĩnh, Cao Bằng, Việt Nam',
        locate: {
          lat: 22.8724128,
          lng: 106.3244756
        }
      },
      {
        name: 'Cửa khẩu Quốc Tế Thanh Thủy',
        location: 'WVP2+83P, Thanh Thủy, Tuyên Quang, Việt Nam',
        locate: {
          lat: 22.9358477,
          lng: 104.8502058
        }
      },
      {
        name: 'Ga Đồng Đăng',
        location: 'QL1B, Cao Lộc, Lạng Sơn, Việt Nam',
        locate: {
          lat: 21.9438019,
          lng: 106.6971159
        }
      },
      {
        name: 'Cửa khẩu Quốc tế Cha lo',
        location: 'MQH8+9GW Cửa khẩu cha lo, QL12A, Dân Hóa, Quảng Trị, Việt Nam',
        locate: {
          lat: 17.6784983,
          lng: 105.766322
        }
      },
      {
        name: 'Thakhek, Lào',
        location: '9RX2+JGF, Thakhek, Lào',
        locate: {
          lat: 17.3990696,
          lng: 104.801292
        }
      },
    ];


    const gates = await Gate.insertMany(gatesData);

    // Create partners
    const partners = [
      {
        name: 'HNT Logistics',
        contact: {
          phone: '0900000001',
          email: 'hnt@example.com',
        },
        waitingCost: 1000000,
        rates: [
          // THAKHEK -> CHALO
          {
            pickup: '6a0297bd01c60058aeb8ab21', // Thakhek
            delivery: '6a0297bd01c60058aeb8ab20', // Chalo
            isReefer: true,
            fixedCost: 13000000,
          },

          // THAKHEK -> HỮU NGHỊ
          {
            pickup: '6a0297bd01c60058aeb8ab21',
            delivery: '6a0297bd01c60058aeb8ab1a',
            isReefer: true,
            fixedCost: 61000000,
          },

          // CHALO -> HỮU NGHỊ
          {
            pickup: '6a0297bd01c60058aeb8ab20',
            delivery: '6a0297bd01c60058aeb8ab1a',
            isReefer: true,
            fixedCost: 51000000,
          },

          // THAKHEK -> MÓNG CÁI
          {
            pickup: '6a0297bd01c60058aeb8ab21',
            delivery: '6a0297bd01c60058aeb8ab1b',
            isReefer: true,
            fixedCost: 64000000,
          },

          // CHALO -> MÓNG CÁI
          {
            pickup: '6a0297bd01c60058aeb8ab20',
            delivery: '6a0297bd01c60058aeb8ab1b',
            isReefer: true,
            fixedCost: 54000000,
          },

          // THAKHEK -> HÀ KHẨU (LÀO CAI)
          {
            pickup: '6a0297bd01c60058aeb8ab21',
            delivery: '6a0297bd01c60058aeb8ab1c',
            isReefer: true,
            fixedCost: 65000000,
          },

          // CHALO -> HÀ KHẨU (LÀO CAI)
          {
            pickup: '6a0297bd01c60058aeb8ab20',
            delivery: '6a0297bd01c60058aeb8ab1c',
            isReefer: true,
            fixedCost: 55000000,
          },

          // THAKHEK -> TRÀ LĨNH
          {
            pickup: '6a0297bd01c60058aeb8ab21',
            delivery: '6a0297bd01c60058aeb8ab1d',
            isReefer: true,
            fixedCost: 68000000,
          },

          // CHALO -> TRÀ LĨNH
          {
            pickup: '6a0297bd01c60058aeb8ab20',
            delivery: '6a0297bd01c60058aeb8ab1d',
            isReefer: true,
            fixedCost: 58000000,
          },

          // THAKHEK -> GA ĐỒNG ĐĂNG
          {
            pickup: '6a0297bd01c60058aeb8ab21',
            delivery: '6a0297bd01c60058aeb8ab1f',
            isReefer: true,
            fixedCost: 51000000,
          },

          // CHALO -> GA ĐỒNG ĐĂNG
          {
            pickup: '6a0297bd01c60058aeb8ab20',
            delivery: '6a0297bd01c60058aeb8ab1f',
            isReefer: true,
            fixedCost: 41000000,
          },
        ],
      },

      {
        name: 'Thiên An - Tứ Tượng',
        contact: {
          phone: '0900000002',
          email: 'tat@example.com',
        },
        waitingCost: 1000000,
        rates: [
          {
            pickup: '6a0297bd01c60058aeb8ab20',
            delivery: '6a0297bd01c60058aeb8ab1a',
            isReefer: true,
            fixedCost: 52000000,
          },
          {
            pickup: '6a0297bd01c60058aeb8ab20',
            delivery: '6a0297bd01c60058aeb8ab1b',
            isReefer: true,
            fixedCost: 55000000,
          },
          {
            pickup: '6a0297bd01c60058aeb8ab20',
            delivery: '6a0297bd01c60058aeb8ab1c',
            isReefer: true,
            fixedCost: 56000000,
          },
          {
            pickup: '6a0297bd01c60058aeb8ab20',
            delivery: '6a0297bd01c60058aeb8ab1e',
            isReefer: true,
            fixedCost: 57000000,
          },
          {
            pickup: '6a0297bd01c60058aeb8ab20',
            delivery: '6a0297bd01c60058aeb8ab1d',
            isReefer: true,
            fixedCost: 58000000,
          },
        ],
      },

      {
        name: 'Container Reefer Express',
        contact: {
          phone: '0900000003',
          email: 'reefer@example.com',
        },
        waitingCost: 1000000,
        rates: [
          {
            pickup: '6a0297bd01c60058aeb8ab20',
            delivery: '6a0297bd01c60058aeb8ab1a',
            isReefer: true,
            fixedCost: 46000000,
          },
          {
            pickup: '6a0297bd01c60058aeb8ab20',
            delivery: '6a0297bd01c60058aeb8ab1b',
            isReefer: true,
            fixedCost: 49000000,
          },
          {
            pickup: '6a0297bd01c60058aeb8ab20',
            delivery: '6a0297bd01c60058aeb8ab1c',
            isReefer: true,
            fixedCost: 50000000,
          },
          {
            pickup: '6a0297bd01c60058aeb8ab20',
            delivery: '6a0297bd01c60058aeb8ab1e',
            isReefer: true,
            fixedCost: 51000000,
          },
          {
            pickup: '6a0297bd01c60058aeb8ab20',
            delivery: '6a0297bd01c60058aeb8ab1d',
            isReefer: true,
            fixedCost: 51000000,
          },
        ],
      },
    ];

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
