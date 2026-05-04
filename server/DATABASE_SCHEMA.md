# MongoDB Collections

Tai lieu nay gom cac collection can co cho backend hien tai.

## 1. orders

Luu don van chuyen.

Fields:
- code: String, unique
- sender: String
- receiver: String
- address: String
- cargoType: String
- dimension: String
- weight: String
- status: String
- eta: String

## 2. vehicles

Luu thong tin phuong tien.

Fields:
- plate: String, unique
- type: String
- capacity: String
- status: String
- fuel: Number
- route: String

## 3. drivers

Luu thong tin tai xe.

Fields:
- name: String
- license: String
- phone: String, unique
- status: String
- schedule: String
- score: Number

## 4. trips

Luu chuyen di va phan cong.

Fields:
- route: String
- vehicle: String
- driver: String
- orders: Array<String>
- optimize: String
- status: String

## 5. trackingvehicles

Luu tracking GPS cua xe.

Fields:
- vehicle: String
- location: String
- eta: String
- shipment: String
- status: String
- history: String

## 6. inventories

Luu ton kho.

Fields:
- warehouse: String
- sku: String
- product: String
- inbound: Number
- outbound: Number
- stock: Number
- position: String

## 7. costrows

Luu chi phi van hanh theo chuyen.

Fields:
- trip: String
- fuel: Number
- toll: Number
- shippingFee: Number
- driverCost: Number

## 8. invoices

Luu hoa don va thanh toan.

Fields:
- invoiceNo: String, unique
- customer: String
- amount: Number
- payment: String
- channel: String
- date: String

## 9. users

Luu nguoi dung he thong.

Fields:
- name: String
- role: String
- access: String
- status: String

## 10. metrics

Luu KPI tong hop dashboard.

Fields:
- totalOrdersToday: Number
- activeVehicles: Number
- deliveringOrders: Number
- revenueToday: Number
- activeTrips: Number
- avgDriverPerformance: Number
- operationCostRate: Number

## Ghi chu

- Backend hien tai dung ten model Mongoose: Order, Vehicle, Driver, Trip, TrackingVehicle, Inventory, CostRow, Invoice, User, Metric.
- Ten collection MongoDB mac dinh se la dang so nhieu cua model, vi du: orders, vehicles, drivers, trips, trackingvehicles, inventories, costrows, invoices, users, metrics.
- Neu muon tao database mau, co the chay script seed o `server/src/seed/seed.js`.
