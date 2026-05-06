# Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Applications                      │
│              (Postman, Web Browser, Mobile App)                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP/REST
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                    Express Server                               │
│                  (src/index.js)                                 │
├─────────────────────────────────────────────────────────────────┤
│  Middleware:                                                    │
│  ├─ CORS Handling                                              │
│  ├─ JSON Body Parser                                           │
│  ├─ Request Logging                                            │
│  └─ Error Handler                                              │
└────┬────────────────┬─────────────────┬──────────────┬─────────┘
     │                │                 │              │
     │                │                 │              │
┌────▼────┐   ┌──────▼───────┐   ┌─────▼────┐   ┌────▼──────┐
│ Vehicles │   │   Drivers    │   │  Orders  │   │   Trips   │
│ Routes   │   │   Routes     │   │  Routes  │   │  Routes   │
└────┬────┘   └──────┬───────┘   └─────┬────┘   └────┬──────┘
     │                │                 │              │
     │                │                 │              │
┌────▼────┐   ┌──────▼───────┐   ┌─────▼────┐   ┌────▼──────┐
│ Vehicle  │   │   Driver     │   │  Order   │   │   Trip    │
│ Ctrl     │   │   Ctrl       │   │  Ctrl    │   │   Ctrl    │
└────┬────┘   └──────┬───────┘   └─────┬────┘   └────┬──────┘
     │                │                 │              │
     └────────────────┼─────────────────┼──────────────┘
                      │
                      │
     ┌────────────────▼──────────────────────┐
     │      Input Validation Middleware      │
     │      (src/middleware/validation.js)   │
     │                                       │
     │  ├─ vehicleSchema (Joi)              │
     │  ├─ driverSchema (Joi)               │
     │  ├─ orderSchema (Joi)                │
     │  └─ tripSchema (Joi)                 │
     └────────────────┬──────────────────────┘
                      │
┌─────────────────────▼──────────────────────────┐
│            MongoDB Models                      │
│        (src/models/*.js)                       │
├──────────────────────────────────────────────┤
│  ├─ Vehicle.js                               │
│  │   └─ id, licensePlate, fuelRate, status   │
│  ├─ Driver.js                                │
│  │   └─ id, name, phone, licenseNumber, ... │
│  ├─ Order.js                                 │
│  │   └─ id, type, location, status, cost     │
│  └─ Trip.js                                  │
│      └─ id, vehicleId, driverId, orders...  │
└──────────────────────┬──────────────────────┘
                       │
                       │ Mongoose ODM
                       │
┌──────────────────────▼──────────────────────┐
│           MongoDB Database                   │
│      (Local or MongoDB Atlas)                │
├──────────────────────────────────────────────┤
│  Collections:                                │
│  ├─ vehicles                                 │
│  ├─ drivers                                  │
│  ├─ orders                                   │
│  └─ trips                                    │
└──────────────────────────────────────────────┘
```

## Data Flow Diagram

### Create Request Flow
```
Client Request
    │
    │ POST /api/vehicles
    │ {id, licensePlate, fuelRate, status}
    │
    ▼
Express Route Handler
    │
    ▼
Input Validation (Joi)
    │
    ├─ Valid ──▶ Continue
    │
    └─ Invalid ──▶ Return 400 Error
                   {errors: [{field, message}]}
    │
    ▼
Controller (Create)
    │
    ├─ Check Duplicates
    │  └─ Unique ID, License Plate
    │
    ├─ Create Mongoose Document
    │
    └─ Save to MongoDB
       │
       ├─ Success ──▶ Return 201 + Data
       │
       └─ Error ──▶ Return 400 + Error Message
```

### Trip Creation Flow (with Relationships)
```
POST /api/trips
    │
    ▼
Validation (Joi schema)
    │
    ├─ Check required fields
    │
    └─ Validate enums
    │
    ▼
Vehicle Exists Check
    │
    └─ Query: Vehicle.findOne({id: vehicleId})
    │
    ├─ Found ──▶ Continue
    │
    └─ Not Found ──▶ Return 400 Error
    │
    ▼
Driver Exists Check
    │
    └─ Query: Driver.findOne({id: driverId})
    │
    ├─ Found ──▶ Continue
    │
    └─ Not Found ──▶ Return 400 Error
    │
    ▼
Order Exists Check (Order 1)
    │
    └─ Query: Order.findOne({id: order1Id})
    │
    ├─ Found ──▶ Continue
    │
    └─ Not Found ──▶ Return 400 Error
    │
    ▼
Order Exists Check (Order 2 - Optional)
    │
    └─ If order2Id provided, validate
    │
    ├─ Found ──▶ Continue
    │
    └─ Not Found ──▶ Return 400 Error
    │
    ▼
Create Trip in MongoDB
    │
    └─ Trip.create({...})
    │
    ├─ Success ──▶ Return 201 + Trip Document
    │
    └─ Error ──▶ Return 400 + Error Message
```

## API Endpoint Map

```
BASE URL: /api
    │
    ├─ /vehicles
    │  ├─ POST / ─────────────────────────── Create Vehicle
    │  ├─ GET / ──────────────────────────── Get All Vehicles
    │  └─ /:id
    │     ├─ GET ──────────────────────────── Get Single Vehicle
    │     ├─ PUT ──────────────────────────── Update Vehicle
    │     └─ DELETE ───────────────────────── Delete Vehicle
    │
    ├─ /drivers
    │  ├─ POST / ─────────────────────────── Create Driver
    │  ├─ GET / ──────────────────────────── Get All Drivers
    │  └─ /:id
    │     ├─ GET ──────────────────────────── Get Single Driver
    │     ├─ PUT ──────────────────────────── Update Driver
    │     └─ DELETE ───────────────────────── Delete Driver
    │
    ├─ /orders
    │  ├─ POST / ─────────────────────────── Create Order
    │  ├─ GET / ──────────────────────────── Get All Orders
    │  └─ /:id
    │     ├─ GET ──────────────────────────── Get Single Order
    │     ├─ PUT ──────────────────────────── Update Order
    │     └─ DELETE ───────────────────────── Delete Order
    │
    └─ /trips
       ├─ POST / ─────────────────────────── Create Trip
       ├─ GET / ──────────────────────────── Get All Trips
       ├─ /vehicle/:vehicleId ────────────── Get Trips by Vehicle
       ├─ /driver/:driverId ───────────────── Get Trips by Driver
       └─ /:id
          ├─ GET ──────────────────────────── Get Single Trip
          ├─ PUT ──────────────────────────── Update Trip
          └─ DELETE ───────────────────────── Delete Trip

Health Check: /health ──────────────────────── Server Status
```

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────┐
│                    VEHICLES                             │
├─────────────────────────────────────────────────────────┤
│ id (PK, String)                                         │
│ licensePlate (Unique, String)                           │
│ fuelRate (Number)                                       │
│ status (Enum)                                           │
│ createdAt, updatedAt                                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ One-to-Many
                         │
┌────────────────────────▼────────────────────────────────┐
│                     TRIPS                               │
├─────────────────────────────────────────────────────────┤
│ id (PK, String)                                         │
│ vehicleId (FK, String) ─────────────┐                  │
│ driverId (FK, String) ──────────┐    │                  │
│ order1Id (FK, String) ──────┐   │    │                  │
│ order2Id (FK, String) ──┐   │   │    │                  │
│ route (stopA, stopB)      │   │   │    │                  │
│ status (Enum)             │   │   │    │                  │
│ cost (Number)             │   │   │    │                  │
│ createdAt, updatedAt      │   │   │    │                  │
└────────────┬──────────────┼───┼───┼────┘                  │
             │              │   │   │                        │
             │              │   │   │    ┌──────────────────┘
             │              │   │   │    │
             │              │   │   └────┼──────────────────┐
             │              │   │        │                  │
             │              │   └────────┼────────────┐     │
             │              │            │            │     │
             │              │      ┌─────▼────────────┴─┐   │
             │              │      │                  │   │
┌────────────▼────────┐     │      │                  │   │
│     DRIVERS         │     │      │                  │   │
├────────────────────┤     │      │              ┌────▼──▼──┐
│ id (PK, String)   │     │      │              │  ORDERS  │
│ name              │     │      │              ├──────────┤
│ phone             │     │      │              │ id (PK)  │
│ licenseNumber     │     │      │              │ type     │
│ status            │     │      │              │ location │
│ createdAt,        │     │      │              │ status   │
│ updatedAt         │     │      │              │ cost     │
└───────────────────┘     │      │              │ created  │
                          │      │              └──────────┘
                    Many-to-One (1 Trip Max 2 Orders)
```

## Request/Response Cycle

```
┌─────────────────────┐
│ CLIENT SENDS        │
├─────────────────────┤
│ Method: POST        │
│ URL: /api/vehicles  │
│ Headers:            │
│  - Content-Type:    │
│    application/json │
│ Body:               │
│ {                   │
│   "id": "VH001",    │
│   "licensePlate"... │
│ }                   │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────┐
│  SERVER PROCESSES        │
├──────────────────────────┤
│ 1. Parse request body    │
│ 2. Validate input (Joi)  │
│ 3. Check database        │
│ 4. Save to MongoDB       │
│ 5. Return response       │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  SERVER RESPONSE         │
├──────────────────────────┤
│ Status: 201 Created      │
│ Headers:                 │
│  - Content-Type:         │
│    application/json      │
│ Body:                    │
│ {                        │
│   "_id": "...",          │
│   "id": "VH001",         │
│   "licensePlate"...,     │
│   "createdAt": "...",    │
│   "updatedAt": "..."     │
│ }                        │
└──────────────────────────┘
```

## Middleware Pipeline

```
Client Request
    │
    ▼
┌─────────────────────┐
│ CORS Middleware     │
│ (Allow requests)    │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Body Parser         │
│ (JSON parsing)      │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Request Logger      │
│ (Log method, path)  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Route Handler       │
│ (Match endpoint)    │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Validation          │
│ (Joi schema)        │
└────────┬────────────┘
         │
         ├─ Invalid ──────┐
         │                │
         └─ Valid         │
                          │
         ▼                │
┌─────────────────────┐   │
│ Controller Logic    │   │
│ (CRUD operations)   │   │
└────────┬────────────┘   │
         │                │
         ▼                │
┌─────────────────────┐   │
│ MongoDB Operation   │   │
│ (Save/Read/Update)  │   │
└────────┬────────────┘   │
         │                │
         ▼                │
    Response         Error │
         │                │
         └────────┬───────┘
                  │
                  ▼
         Error Handler
              │
              ▼
         JSON Response
              │
              ▼
          Client
```

## Docker Compose Architecture

```
┌─────────────────────────────────────────────────────┐
│             Docker Network                          │
│        (logistics-network)                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────┐                     │
│  │   MongoDB Container      │                     │
│  ├──────────────────────────┤                     │
│  │ Image: mongo:6.0         │                     │
│  │ Port: 27017 (internal)   │                     │
│  │ Volume: mongodb_data     │                     │
│  │ Auth: root/password      │                     │
│  └────────────┬─────────────┘                     │
│               │                                   │
│               │ Network Connection                │
│               │ (host: mongodb)                   │
│               │                                   │
│  ┌────────────▼──────────────┐                   │
│  │   API Container          │                   │
│  ├──────────────────────────┤                   │
│  │ Build: ./Dockerfile      │                   │
│  │ Port: 3000 → 3000        │                   │
│  │ Depends on: mongodb      │                   │
│  │ env vars set             │                   │
│  └──────────────────────────┘                   │
│                                                     │
└─────────────────────────────────────────────────────┘

Volumes:
├─ mongodb_data → /data/db (MongoDB data)
└─ mongodb_config → /data/configdb (MongoDB config)
```

This architecture ensures:
✅ Complete separation of concerns
✅ Scalable and maintainable code
✅ Clear data flow and relationships
✅ Robust error handling
✅ Production-ready structure
