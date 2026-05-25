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

function buildSeedOrderDate(index) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - index, randInt(1, 25), 12, 0, 0, 0);
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

    const gateMap = {};

    gates.forEach((gate) => {
      gateMap[gate.name] = gate._id;
    });

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
            pickup: gateMap['Thakhek, Lào'],
            delivery: gateMap['Cửa khẩu Quốc tế Cha lo'],
            isReefer: true,
            fixedCost: 13000000,
          },

          // THAKHEK -> HỮU NGHỊ
          {
            pickup: gateMap['Thakhek, Lào'],
            delivery: gateMap['Cửa khẩu Hữu Nghị'],
            isReefer: true,
            fixedCost: 61000000,
          },

          // CHALO -> HỮU NGHỊ
          {
            pickup: gateMap['Cửa khẩu Quốc tế Cha lo'],
            delivery: gateMap['Cửa khẩu Hữu Nghị'],
            isReefer: true,
            fixedCost: 51000000,
          },

          // THAKHEK -> MÓNG CÁI
          {
            pickup: gateMap['Thakhek, Lào'],
            delivery: gateMap['Cửa khẩu Móng Cái'],
            isReefer: true,
            fixedCost: 64000000,
          },

          // CHALO -> MÓNG CÁI
          {
            pickup: gateMap['Cửa khẩu Quốc tế Cha lo'],
            delivery: gateMap['Cửa khẩu Móng Cái'],
            isReefer: true,
            fixedCost: 54000000,
          },

          // THAKHEK -> HÀ KHẨU (LÀO CAI)
          {
            pickup: gateMap['Thakhek, Lào'],
            delivery: gateMap['Cửa khẩu Quốc tế Lào Cai'],
            isReefer: true,
            fixedCost: 65000000,
          },

          // CHALO -> HÀ KHẨU (LÀO CAI)
          {
            pickup: gateMap['Cửa khẩu Quốc tế Cha lo'],
            delivery: gateMap['Cửa khẩu Quốc tế Lào Cai'],
            isReefer: true,
            fixedCost: 55000000,
          },

          // THAKHEK -> TRÀ LĨNH
          {
            pickup: gateMap['Thakhek, Lào'],
            delivery: gateMap['Cửa khẩu Trà Lĩnh'],
            isReefer: true,
            fixedCost: 68000000,
          },

          // CHALO -> TRÀ LĨNH
          {
            pickup: gateMap['Cửa khẩu Quốc tế Cha lo'],
            delivery: gateMap['Cửa khẩu Trà Lĩnh'],
            isReefer: true,
            fixedCost: 58000000,
          },

          // THAKHEK -> GA ĐỒNG ĐĂNG
          {
            pickup: gateMap['Thakhek, Lào'],
            delivery: gateMap['Ga Đồng Đăng'],
            isReefer: true,
            fixedCost: 51000000,
          },

          // CHALO -> GA ĐỒNG ĐĂNG
          {
            pickup: gateMap['Cửa khẩu Quốc tế Cha lo'],
            delivery: gateMap['Ga Đồng Đăng'],
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
            pickup: gateMap['Cửa khẩu Quốc tế Cha lo'],
            delivery: gateMap['Cửa khẩu Hữu Nghị'],
            isReefer: true,
            fixedCost: 52000000,
          },
          {
            pickup: gateMap['Cửa khẩu Quốc tế Cha lo'],
            delivery: gateMap['Cửa khẩu Móng Cái'],
            isReefer: true,
            fixedCost: 55000000,
          },
          {
            pickup: gateMap['Cửa khẩu Quốc tế Cha lo'],
            delivery: gateMap['Cửa khẩu Quốc tế Lào Cai'],
            isReefer: true,
            fixedCost: 56000000,
          },
          {
            pickup: gateMap['Cửa khẩu Quốc tế Cha lo'],
            delivery: gateMap['Cửa khẩu Quốc Tế Thanh Thủy'],
            isReefer: true,
            fixedCost: 57000000,
          },
          {
            pickup: gateMap['Cửa khẩu Quốc tế Cha lo'],
            delivery: gateMap['Cửa khẩu Trà Lĩnh'],
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
            pickup: gateMap['Cửa khẩu Quốc tế Cha lo'],
            delivery: gateMap['Cửa khẩu Hữu Nghị'],
            isReefer: true,
            fixedCost: 46000000,
          },
          {
            pickup: gateMap['Cửa khẩu Quốc tế Cha lo'],
            delivery: gateMap['Cửa khẩu Móng Cái'],
            isReefer: true,
            fixedCost: 49000000,
          },
          {
            pickup: gateMap['Cửa khẩu Quốc tế Cha lo'],
            delivery: gateMap['Cửa khẩu Quốc tế Lào Cai'],
            isReefer: true,
            fixedCost: 50000000,
          },
          {
            pickup: gateMap['Cửa khẩu Quốc tế Cha lo'],
            delivery: gateMap['Cửa khẩu Quốc Tế Thanh Thủy'],
            isReefer: true,
            fixedCost: 51000000,
          },
          {
            pickup: gateMap['Cửa khẩu Quốc tế Cha lo'],
            delivery: gateMap['Cửa khẩu Trà Lĩnh'],
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
    const vehiclePlates = [
      '15H-009.82',
      '15C-122.64',
      '15C-047.87',
      '15C-145.63',
      '15H-008.07',
      '15C-147.06',
      '15C-071.04',
      '15C-144.09',
      '15C-142.94',
      '15C-144.99',
    ];

    // ======================
    // CREATE VEHICLES
    // ======================

    const vehiclesData = vehiclePlates.map((plate) => ({
      licensePlate: plate.replace(/[-.]/g, ''), // 15C14499
      driver: null,
      fuelRate: 33000,
      status: 'idle',
    }));

    const createdVehicles = await Vehicle.insertMany(vehiclesData);

    // ======================
    // CREATE ORDERS
    // ======================

    const orderStatuses = [
      'planned',
      'running',
      'waiting',
      'delivering',
      'completed',
      'cancelled',
    ];

    const ordersData = [];

    for (let i = 0; i < N_ORDERS; i++) {
      const pickupGate = sample(gates)._id;

      let deliveryGate = sample(gates)._id;

      while (deliveryGate.equals(pickupGate)) {
        deliveryGate = sample(gates)._id;
      }

      const partner = sample(createdPartners)._id;

      // chọn xe
      const vehicleObj = sample(createdVehicles);

      // update status vehicle
      vehicleObj.status = 'running';

      ordersData.push({
        partner,
        driver: null,
        vehicle: vehicleObj._id,
        pickup: pickupGate,
        delivery: deliveryGate,
        isReefer: Math.random() < 0.2,
        status: sample(orderStatuses),
        orderDate: buildSeedOrderDate(i),
        cost: randInt(200, 2000),
        waitingCost: randInt(0, 200),
      });
    }

    // update status trong DB
    await Promise.all(
      createdVehicles.map((vehicle) =>
        Vehicle.findByIdAndUpdate(vehicle._id, {
          status: vehicle.status,
        })
      )
    );

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
