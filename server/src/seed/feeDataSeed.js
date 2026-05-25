const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Fee = require('../models/Fee');
const Vehicle = require('../models/Vehicle');

function parseMonth(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return { year, monthIndex: month - 1 };
}

function buildDate(monthKey, day) {
  const { year, monthIndex } = parseMonth(monthKey);
  return new Date(year, monthIndex, day, 12, 0, 0, 0);
}

function roundAmount(quantity, unitPrice) {
  return Math.round(Number(quantity) * Number(unitPrice));
}

function makeDieselEntry(monthKey, spec, vehiclesByPlate) {
  const vehicle = vehiclesByPlate.get(spec.plate) || null;
  const quantity = Number(spec.quantity);
  const unitPrice = Number(spec.unitPrice);

  return {
    date: buildDate(monthKey, spec.day),
    vehicle: vehicle ? vehicle._id : undefined,
    quantity,
    unitPrice,
    amount: roundAmount(quantity, unitPrice),
  };
}

function makeOtherEntry(monthKey, spec, vehiclesByPlate) {
  const vehicle = vehiclesByPlate.get(spec.plate) || null;

  return {
    date: buildDate(monthKey, spec.day),
    vehicle: vehicle ? vehicle._id : undefined,
    name: spec.name,
    amount: Number(spec.amount),
  };
}

function buildMonthPlan(monthKey, dieselSpecs, otherSpecs, vehiclesByPlate) {
  const dieselFees = dieselSpecs.map((spec) => makeDieselEntry(monthKey, spec, vehiclesByPlate));
  const otherFees = otherSpecs.map((spec) => makeOtherEntry(monthKey, spec, vehiclesByPlate));
  const totalDieselFee = dieselFees.reduce((total, item) => total + (Number(item.amount) || 0), 0);
  const totalOtherFee = otherFees.reduce((total, item) => total + (Number(item.amount) || 0), 0);

  return {
    month: monthKey,
    dieselFees,
    otherFees,
    totalDieselFee,
    totalOtherFee,
    totalAmount: totalDieselFee + totalOtherFee,
  };
}

function getSeedPlans(vehiclesByPlate) {
  return [
    buildMonthPlan(
      '2025-11',
      [
        { day: 4, plate: '15C14294', quantity: 462, unitPrice: 17620 },
        { day: 6, plate: '15H00982', quantity: 418.5, unitPrice: 17620 },
        { day: 8, plate: '15C14499', quantity: 151, unitPrice: 17620 },
        { day: 12, plate: '15C14409', quantity: 505, unitPrice: 17620 },
        { day: 15, plate: '15H00807', quantity: 172, unitPrice: 17850 },
        { day: 18, plate: '15C14563', quantity: 640, unitPrice: 17850 },
        { day: 21, plate: '15C12264', quantity: 487, unitPrice: 18050 },
        { day: 25, plate: '15C14706', quantity: 230, unitPrice: 18050 },
      ],
      [
        { day: 7, plate: '15H00982', name: 'nhot 4.5l*93', amount: 2750000 },
        { day: 19, plate: '15C14499', name: 'cao toc, cau duong', amount: 860000 },
        { day: 27, plate: '15C14294', name: 'sua chua rot hoi', amount: 1450000 },
      ],
      vehiclesByPlate
    ),
    buildMonthPlan(
      '2025-12',
      [
        { day: 2, plate: '15C14294', quantity: 470, unitPrice: 17620 },
        { day: 5, plate: '15C14409', quantity: 413.5, unitPrice: 17620 },
        { day: 9, plate: '15H00982', quantity: 165, unitPrice: 17620 },
        { day: 11, plate: '15C14499', quantity: 489, unitPrice: 17620 },
        { day: 15, plate: '15H00807', quantity: 160, unitPrice: 17620 },
        { day: 18, plate: '15C14563', quantity: 765, unitPrice: 17620 },
        { day: 21, plate: '15C12264', quantity: 476, unitPrice: 17850 },
        { day: 24, plate: '15C14706', quantity: 440, unitPrice: 17850 },
        { day: 27, plate: '15H00807', quantity: 175, unitPrice: 18050 },
        { day: 29, plate: '15C14294', quantity: 897, unitPrice: 18050 },
      ],
      [
        { day: 4, plate: '15C14499', name: 'phi ben bai', amount: 1100000 },
        { day: 13, plate: '15H00982', name: 'nhot, loc dau', amount: 2980000 },
        { day: 26, plate: '15C14294', name: 've sinh, khau hao vat tu', amount: 650000 },
      ],
      vehiclesByPlate
    ),
    buildMonthPlan(
      '2026-01',
      [
        { day: 15, plate: '15C14294', quantity: 470, unitPrice: 17620 },
        { day: 17, plate: '15C14499', quantity: 413.5, unitPrice: 17620 },
        { day: 17, plate: '15C14294', quantity: 165, unitPrice: 17620 },
        { day: 18, plate: '15C14409', quantity: 489, unitPrice: 17620 },
        { day: 19, plate: '15C14409', quantity: 160, unitPrice: 17620 },
        { day: 20, plate: '15H00982', quantity: 765, unitPrice: 17620 },
        { day: 20, plate: '15H00807', quantity: 476, unitPrice: 17620 },
        { day: 22, plate: '15C14294', quantity: 440, unitPrice: 17620 },
        { day: 22, plate: '15H00807', quantity: 175, unitPrice: 18050 },
        { day: 22, plate: '15C12264', quantity: 897, unitPrice: 18050 },
        { day: 23, plate: '15C14294', quantity: 150, unitPrice: 18050 },
        { day: 24, plate: '15C14563', quantity: 656, unitPrice: 18050 },
        { day: 24, plate: '15C14499', quantity: 800, unitPrice: 18050 },
        { day: 24, plate: '15H00807', quantity: 400, unitPrice: 18050 },
        { day: 26, plate: '15H00982', quantity: 560, unitPrice: 18050 },
        { day: 26, plate: '15H00807', quantity: 140, unitPrice: 18050 },
        { day: 27, plate: '15C14294', quantity: 460, unitPrice: 18050 },
        { day: 29, plate: '15C12264', quantity: 635, unitPrice: 18530 },
      ],
      [
        { day: 20, plate: '15H00982', name: 'nhot 4.5l*93', amount: 2850000 },
        { day: 22, plate: '15C14499', name: 'cau duong, cao toc', amount: 1760000 },
        { day: 24, plate: '15C14563', name: 'sua chua may lanh cabin', amount: 2400000 },
        { day: 28, plate: '15C12264', name: 'dung bai, ve sinh', amount: 780000 },
      ],
      vehiclesByPlate
    ),
    buildMonthPlan(
      '2026-02',
      [
        { day: 1, plate: '15C14409', quantity: 456, unitPrice: 17720 },
        { day: 3, plate: '15C14294', quantity: 398.5, unitPrice: 17720 },
        { day: 5, plate: '15H00982', quantity: 212, unitPrice: 17720 },
        { day: 7, plate: '15C14499', quantity: 521, unitPrice: 17720 },
        { day: 10, plate: '15H00807', quantity: 176, unitPrice: 17720 },
        { day: 13, plate: '15C14563', quantity: 689, unitPrice: 17900 },
        { day: 15, plate: '15C12264', quantity: 435, unitPrice: 17900 },
        { day: 19, plate: '15C14706', quantity: 287, unitPrice: 17900 },
        { day: 22, plate: '15C14294', quantity: 744, unitPrice: 18120 },
        { day: 25, plate: '15H00982', quantity: 155, unitPrice: 18120 },
        { day: 27, plate: '15C14409', quantity: 510, unitPrice: 18120 },
      ],
      [
        { day: 6, plate: '15C14499', name: 'nhot 4.5l*93', amount: 2480000 },
        { day: 12, plate: '15H00807', name: 'phi ben bai', amount: 920000 },
        { day: 18, plate: '15C14563', name: 'thay lop, canh chinh phanh', amount: 3150000 },
        { day: 26, plate: '15C12264', name: 'rửa xe, vệ sinh thùng', amount: 560000 },
      ],
      vehiclesByPlate
    ),
    buildMonthPlan(
      '2026-03',
      [
        { day: 2, plate: '15C14294', quantity: 440, unitPrice: 17820 },
        { day: 4, plate: '15C14499', quantity: 375.5, unitPrice: 17820 },
        { day: 6, plate: '15H00982', quantity: 198, unitPrice: 17820 },
        { day: 9, plate: '15C14409', quantity: 515, unitPrice: 17820 },
        { day: 12, plate: '15H00807', quantity: 166, unitPrice: 17820 },
        { day: 15, plate: '15C14563', quantity: 603, unitPrice: 18020 },
        { day: 18, plate: '15C12264', quantity: 488, unitPrice: 18020 },
        { day: 21, plate: '15C14706', quantity: 230, unitPrice: 18020 },
        { day: 24, plate: '15C14294', quantity: 790, unitPrice: 18250 },
        { day: 27, plate: '15H00982', quantity: 145, unitPrice: 18250 },
        { day: 30, plate: '15C14409', quantity: 540, unitPrice: 18250 },
        { day: 30, plate: '15C14499', quantity: 167, unitPrice: 18250 },
      ],
      [
        { day: 5, plate: '15C14294', name: 'nhot 4.5l*93', amount: 2920000 },
        { day: 14, plate: '15C14409', name: 'cao toc, cau duong', amount: 1340000 },
        { day: 23, plate: '15C14563', name: 'bao duong may lanh cabin', amount: 1880000 },
      ],
      vehiclesByPlate
    ),
    buildMonthPlan(
      '2026-04',
      [
        { day: 3, plate: '15C14294', quantity: 462, unitPrice: 17850 },
        { day: 6, plate: '15C14499', quantity: 389, unitPrice: 17850 },
        { day: 9, plate: '15H00982', quantity: 205.5, unitPrice: 17850 },
        { day: 12, plate: '15C14409', quantity: 495, unitPrice: 17850 },
        { day: 15, plate: '15H00807', quantity: 170, unitPrice: 17850 },
        { day: 18, plate: '15C14563', quantity: 648, unitPrice: 18070 },
        { day: 21, plate: '15C12264', quantity: 447, unitPrice: 18070 },
        { day: 24, plate: '15C14706', quantity: 260, unitPrice: 18070 },
        { day: 27, plate: '15C14294', quantity: 708, unitPrice: 18300 },
        { day: 29, plate: '15H00982', quantity: 156, unitPrice: 18300 },
      ],
      [
        { day: 8, plate: '15C14499', name: 'nhot 4.5l*93', amount: 2840000 },
        { day: 16, plate: '15C14409', name: 'phi ben bai', amount: 1040000 },
        { day: 25, plate: '15C14563', name: 'sua chua, thay loc dau', amount: 2260000 },
      ],
      vehiclesByPlate
    ),
    buildMonthPlan(
      '2026-05',
      [
        { day: 2, plate: '15C14294', quantity: 470, unitPrice: 17920 },
        { day: 5, plate: '15C14499', quantity: 413.5, unitPrice: 17920 },
        { day: 7, plate: '15H00982', quantity: 165, unitPrice: 17920 },
        { day: 11, plate: '15C14409', quantity: 489, unitPrice: 17920 },
        { day: 14, plate: '15H00807', quantity: 160, unitPrice: 17920 },
        { day: 18, plate: '15C14563', quantity: 765, unitPrice: 18140 },
        { day: 21, plate: '15C12264', quantity: 476, unitPrice: 18140 },
        { day: 24, plate: '15C14706', quantity: 440, unitPrice: 18140 },
        { day: 27, plate: '15C14294', quantity: 635, unitPrice: 18380 },
      ],
      [
        { day: 9, plate: '15H00982', name: 'nhot 4.5l*93', amount: 2960000 },
        { day: 19, plate: '15C14499', name: 'cau duong, bot sung', amount: 1180000 },
      ],
      vehiclesByPlate
    ),
  ];
}

async function seedFeeData() {
  const conn = await connectDB();

  try {
    const vehicles = await Vehicle.find({}, { licensePlate: 1 }).lean();
    const vehiclesByPlate = new Map(vehicles.map((vehicle) => [String(vehicle.licensePlate).toUpperCase(), vehicle]));

    const plans = getSeedPlans(vehiclesByPlate);

    await Fee.deleteMany({});
    await Fee.insertMany(plans);

    console.log('Fee seed complete:');
    console.log(`  Months: ${plans.length}`);
    console.log(`  Vehicles available: ${vehicles.length}`);

    await conn.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Fee seeding error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

if (require.main === module) {
  seedFeeData();
}

module.exports = {
  seedFeeData,
  getSeedPlans,
};