import {
  costRows,
  driverStatusColor,
  drivers,
  inventory,
  invoices,
  mapMarkers,
  menuItems,
  metrics,
  orderStatusColor,
  orders,
  pageMeta,
  trackingVehicles,
  trips,
  users,
  vehicleStatusColor,
  vehicles,
} from '../data/mockData'

export const mockDataService = {
  getDashboardData() {
    return {
      menuItems,
      pageMeta,
      metrics,
      trackingVehicles,
      mapMarkers,
    }
  },

  getOrdersData() {
    return {
      orders,
      orderStatusColor,
    }
  },

  getVehiclesData() {
    return {
      vehicles,
      vehicleStatusColor,
    }
  },

  getDriversData() {
    return {
      drivers,
      driverStatusColor,
    }
  },

  getTripsData() {
    return {
      trips,
    }
  },

  getWarehouseData() {
    return {
      inventory,
    }
  },

  getCostsData() {
    return {
      costRows,
    }
  },

  getBillingData() {
    return {
      invoices,
    }
  },

  getUsersData() {
    return {
      users,
    }
  },
}
