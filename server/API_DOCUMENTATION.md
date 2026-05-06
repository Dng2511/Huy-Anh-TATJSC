# API Documentation

## Overview

This is a comprehensive REST API for managing logistics operations including vehicles, drivers, orders, and trips.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API does not require authentication. Future versions will implement JWT-based authentication.

---

## 🚛 Vehicles Endpoints

### Create Vehicle
**Endpoint:** `POST /vehicles`

Creates a new vehicle in the system.

**Request Body:**
```json
{
  "id": "VH001",
  "licensePlate": "ABC123XY",
  "fuelRate": 8.5,
  "status": "idle"
}
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "id": "VH001",
  "licensePlate": "ABC123XY",
  "fuelRate": 8.5,
  "status": "idle",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (400):**
```json
{
  "error": "Vehicle with this ID or license plate already exists"
}
```

---

### Get All Vehicles
**Endpoint:** `GET /vehicles`

Retrieves all vehicles.

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "id": "VH001",
    "licensePlate": "ABC123XY",
    "fuelRate": 8.5,
    "status": "idle",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### Get Vehicle by ID
**Endpoint:** `GET /vehicles/:id`

Retrieves a specific vehicle by its ID.

**Parameters:**
- `id` (string, required): Vehicle ID

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "id": "VH001",
  "licensePlate": "ABC123XY",
  "fuelRate": 8.5,
  "status": "idle",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "Vehicle not found"
}
```

---

### Update Vehicle
**Endpoint:** `PUT /vehicles/:id`

Updates an existing vehicle.

**Parameters:**
- `id` (string, required): Vehicle ID

**Request Body:**
```json
{
  "id": "VH001",
  "licensePlate": "ABC123XY",
  "fuelRate": 7.8,
  "status": "running"
}
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "id": "VH001",
  "licensePlate": "ABC123XY",
  "fuelRate": 7.8,
  "status": "running",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

---

### Delete Vehicle
**Endpoint:** `DELETE /vehicles/:id`

Deletes a vehicle.

**Parameters:**
- `id` (string, required): Vehicle ID

**Response (200 OK):**
```json
{
  "message": "Vehicle deleted successfully"
}
```

---

## 👨‍✈️ Drivers Endpoints

### Create Driver
**Endpoint:** `POST /drivers`

Creates a new driver.

**Request Body:**
```json
{
  "id": "DR001",
  "name": "Nguyễn Văn A",
  "phone": "0912345678",
  "licenseNumber": "DL123456",
  "status": "available"
}
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "id": "DR001",
  "name": "Nguyễn Văn A",
  "phone": "0912345678",
  "licenseNumber": "DL123456",
  "status": "available",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Get All Drivers
**Endpoint:** `GET /drivers`

Retrieves all drivers.

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "id": "DR001",
    "name": "Nguyễn Văn A",
    "phone": "0912345678",
    "licenseNumber": "DL123456",
    "status": "available",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### Get Driver by ID
**Endpoint:** `GET /drivers/:id`

Retrieves a specific driver by ID.

**Parameters:**
- `id` (string, required): Driver ID

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "id": "DR001",
  "name": "Nguyễn Văn A",
  "phone": "0912345678",
  "licenseNumber": "DL123456",
  "status": "available",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Update Driver
**Endpoint:** `PUT /drivers/:id`

Updates an existing driver.

**Parameters:**
- `id` (string, required): Driver ID

**Request Body:**
```json
{
  "id": "DR001",
  "name": "Nguyễn Văn A",
  "phone": "0987654321",
  "licenseNumber": "DL123456",
  "status": "on_trip"
}
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "id": "DR001",
  "name": "Nguyễn Văn A",
  "phone": "0987654321",
  "licenseNumber": "DL123456",
  "status": "on_trip",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

---

### Delete Driver
**Endpoint:** `DELETE /drivers/:id`

Deletes a driver.

**Parameters:**
- `id` (string, required): Driver ID

**Response (200 OK):**
```json
{
  "message": "Driver deleted successfully"
}
```

---

## 📦 Orders Endpoints

### Create Order
**Endpoint:** `POST /orders`

Creates a new order.

**Request Body:**
```json
{
  "id": "ORD001",
  "type": "OUT",
  "location": "A",
  "status": "pending",
  "cost": 500000
}
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "id": "ORD001",
  "type": "OUT",
  "location": "A",
  "status": "pending",
  "cost": 500000,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Order Types:**
- `OUT`: Hải Phòng → A
- `IN`: B → Hải Phòng

---

### Get All Orders
**Endpoint:** `GET /orders`

Retrieves all orders.

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "id": "ORD001",
    "type": "OUT",
    "location": "A",
    "status": "pending",
    "cost": 500000,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### Get Order by ID
**Endpoint:** `GET /orders/:id`

Retrieves a specific order by ID.

**Parameters:**
- `id` (string, required): Order ID

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "id": "ORD001",
  "type": "OUT",
  "location": "A",
  "status": "pending",
  "cost": 500000,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Update Order
**Endpoint:** `PUT /orders/:id`

Updates an existing order.

**Parameters:**
- `id` (string, required): Order ID

**Request Body:**
```json
{
  "id": "ORD001",
  "type": "OUT",
  "location": "A",
  "status": "assigned",
  "cost": 500000
}
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "id": "ORD001",
  "type": "OUT",
  "location": "A",
  "status": "assigned",
  "cost": 500000,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

---

### Delete Order
**Endpoint:** `DELETE /orders/:id`

Deletes an order.

**Parameters:**
- `id` (string, required): Order ID

**Response (200 OK):**
```json
{
  "message": "Order deleted successfully"
}
```

---

## 🛣️ Trips Endpoints

### Create Trip
**Endpoint:** `POST /trips`

Creates a new trip.

**Request Body:**
```json
{
  "id": "TRIP001",
  "vehicleId": "VH001",
  "driverId": "DR001",
  "order1Id": "ORD001",
  "order2Id": "ORD002",
  "route": {
    "stopA": "Hải Phòng",
    "stopB": "Location A"
  },
  "status": "planned",
  "cost": 1100000
}
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "id": "TRIP001",
  "vehicleId": "VH001",
  "driverId": "DR001",
  "order1Id": "ORD001",
  "order2Id": "ORD002",
  "route": {
    "stopA": "Hải Phòng",
    "stopB": "Location A"
  },
  "status": "planned",
  "cost": 1100000,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Get All Trips
**Endpoint:** `GET /trips`

Retrieves all trips.

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "id": "TRIP001",
    "vehicleId": "VH001",
    "driverId": "DR001",
    "order1Id": "ORD001",
    "order2Id": "ORD002",
    "route": {
      "stopA": "Hải Phòng",
      "stopB": "Location A"
    },
    "status": "planned",
    "cost": 1100000,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### Get Trip by ID
**Endpoint:** `GET /trips/:id`

Retrieves a specific trip by ID.

**Parameters:**
- `id` (string, required): Trip ID

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "id": "TRIP001",
  "vehicleId": "VH001",
  "driverId": "DR001",
  "order1Id": "ORD001",
  "order2Id": "ORD002",
  "route": {
    "stopA": "Hải Phòng",
    "stopB": "Location A"
  },
  "status": "planned",
  "cost": 1100000,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Get Trips by Vehicle
**Endpoint:** `GET /trips/vehicle/:vehicleId`

Retrieves all trips for a specific vehicle.

**Parameters:**
- `vehicleId` (string, required): Vehicle ID

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "id": "TRIP001",
    "vehicleId": "VH001",
    ...
  }
]
```

---

### Get Trips by Driver
**Endpoint:** `GET /trips/driver/:driverId`

Retrieves all trips for a specific driver.

**Parameters:**
- `driverId` (string, required): Driver ID

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "id": "TRIP001",
    "driverId": "DR001",
    ...
  }
]
```

---

### Update Trip
**Endpoint:** `PUT /trips/:id`

Updates an existing trip.

**Parameters:**
- `id` (string, required): Trip ID

**Request Body:**
```json
{
  "id": "TRIP001",
  "vehicleId": "VH001",
  "driverId": "DR001",
  "order1Id": "ORD001",
  "order2Id": "ORD002",
  "route": {
    "stopA": "Hải Phòng",
    "stopB": "Location A"
  },
  "status": "running",
  "cost": 1100000
}
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "id": "TRIP001",
  "vehicleId": "VH001",
  "driverId": "DR001",
  "order1Id": "ORD001",
  "order2Id": "ORD002",
  "route": {
    "stopA": "Hải Phòng",
    "stopB": "Location A"
  },
  "status": "running",
  "cost": 1100000,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

---

### Delete Trip
**Endpoint:** `DELETE /trips/:id`

Deletes a trip.

**Parameters:**
- `id` (string, required): Trip ID

**Response (200 OK):**
```json
{
  "message": "Trip deleted successfully"
}
```

---

## Status Enums

### Vehicle Status
- `idle` - Vehicle is available
- `running` - Vehicle is in use
- `maintenance` - Vehicle is under maintenance

### Driver Status
- `available` - Driver is available for assignment
- `on_trip` - Driver is currently on a trip
- `off` - Driver is off duty

### Order Status
- `pending` - Order is waiting to be assigned
- `assigned` - Order has been assigned to a trip
- `done` - Order has been completed

### Trip Status
- `planned` - Trip is planned but not started
- `running` - Trip is currently active
- `completed` - Trip has been completed

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Description of the error"
}
```

### Common Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input or duplicate entry
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Data Validation

All endpoints validate input data. Example validation error response:

```json
{
  "errors": [
    {
      "field": "licensePlate",
      "message": "License plate cannot be empty"
    },
    {
      "field": "fuelRate",
      "message": "Fuel rate must be a positive number"
    }
  ]
}
```

---

## Notes

- All IDs must be unique within their respective resource type
- License plates and license numbers must be unique
- Phone numbers must contain only digits, spaces, '+', and '-' characters
- Fuel rate and costs must be positive numbers
- Routes require both stopA and stopB
- Trips can have maximum 2 orders (order1Id is required, order2Id is optional)
