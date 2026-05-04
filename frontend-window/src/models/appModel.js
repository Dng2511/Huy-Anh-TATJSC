import { mockDataService } from '../services/mockDataService'

export function createAppModel() {
  const dashboard = mockDataService.getDashboardData()
  const orders = mockDataService.getOrdersData()
  const vehicles = mockDataService.getVehiclesData()
  const drivers = mockDataService.getDriversData()
  const trips = mockDataService.getTripsData()
  const warehouse = mockDataService.getWarehouseData()
  const costs = mockDataService.getCostsData()
  const billing = mockDataService.getBillingData()
  const users = mockDataService.getUsersData()

  return {
    menuItems: dashboard.menuItems,
    pageMeta: dashboard.pageMeta,
    metrics: dashboard.metrics,
    trackingVehicles: dashboard.trackingVehicles,
    mapMarkers: dashboard.mapMarkers,
    orders: orders.orders,
    orderStatusColor: orders.orderStatusColor,
    vehicles: vehicles.vehicles,
    vehicleStatusColor: vehicles.vehicleStatusColor,
    drivers: drivers.drivers,
    driverStatusColor: drivers.driverStatusColor,
    trips: trips.trips,
    inventory: warehouse.inventory,
    costRows: costs.costRows,
    invoices: billing.invoices,
    users: users.users,
  }
}
