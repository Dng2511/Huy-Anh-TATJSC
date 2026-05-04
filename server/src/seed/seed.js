import dotenv from 'dotenv'
import { connectDatabase } from '../config/db.js'
import {
  CostRow,
  Driver,
  Inventory,
  Invoice,
  Metric,
  Order,
  TrackingVehicle,
  Trip,
  User,
  Vehicle,
} from '../models/index.js'
import { seedData } from './seedData.js'

dotenv.config()

async function seed() {
  try {
    await connectDatabase()

    await Promise.all([
      Order.deleteMany({}),
      Vehicle.deleteMany({}),
      Driver.deleteMany({}),
      Trip.deleteMany({}),
      TrackingVehicle.deleteMany({}),
      Inventory.deleteMany({}),
      CostRow.deleteMany({}),
      Invoice.deleteMany({}),
      User.deleteMany({}),
      Metric.deleteMany({}),
    ])

    await Promise.all([
      Order.insertMany(seedData.orders),
      Vehicle.insertMany(seedData.vehicles),
      Driver.insertMany(seedData.drivers),
      Trip.insertMany(seedData.trips),
      TrackingVehicle.insertMany(seedData.tracking),
      Inventory.insertMany(seedData.inventory),
      CostRow.insertMany(seedData.costs),
      Invoice.insertMany(seedData.invoices),
      User.insertMany(seedData.users),
      Metric.insertMany(seedData.metrics),
    ])

    console.log('Seed completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

seed()
