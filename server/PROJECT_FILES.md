# Project Files Summary

This document provides an overview of all files in the Logistics Management API Server project.

## Root Files

### Configuration Files
- **`package.json`** - NPM package configuration with dependencies and scripts
- **`.env`** - Environment variables (don't commit to Git)
- **`.env.example`** - Template for environment variables (commit to Git)
- **`.gitignore`** - Git ignore rules for node_modules, .env, etc.

### Documentation Files
- **`README.md`** - Main project documentation
- **`QUICKSTART.md`** - Quick start guide for setup and testing
- **`API_DOCUMENTATION.md`** - Comprehensive API endpoint documentation
- **`ENV_CONFIG.md`** - Environment variables configuration guide

### Docker Files
- **`Dockerfile`** - Container image definition for the API
- **`docker-compose.yml`** - Docker Compose configuration for API + MongoDB

### API Testing
- **`requests.http`** - HTTP requests file for REST Client or copy to Postman

---

## Source Code Structure (`src/`)

### Main Application File
- **`src/index.js`** - Express server setup and route initialization

### Configuration (`src/config/`)
- **`src/config/database.js`** - MongoDB connection configuration

### Database Models (`src/models/`)
- **`src/models/Vehicle.js`** - Vehicle schema and model
- **`src/models/Driver.js`** - Driver schema and model
- **`src/models/Order.js`** - Order schema and model
- **`src/models/Trip.js`** - Trip schema and model
- **`src/models/index.js`** - Barrel export for all models

### Controllers (`src/controllers/`)
- **`src/controllers/vehicleController.js`** - Vehicle CRUD logic
- **`src/controllers/driverController.js`** - Driver CRUD logic
- **`src/controllers/orderController.js`** - Order CRUD logic
- **`src/controllers/tripController.js`** - Trip CRUD logic with validation

### Routes (`src/routes/`)
- **`src/routes/vehicleRoutes.js`** - Vehicle API endpoints
- **`src/routes/driverRoutes.js`** - Driver API endpoints
- **`src/routes/orderRoutes.js`** - Order API endpoints
- **`src/routes/tripRoutes.js`** - Trip API endpoints

### Middleware (`src/middleware/`)
- **`src/middleware/validation.js`** - Input validation using Joi

---

## File Purposes

### Models
Each model file contains:
- MongoDB schema definition
- Field validation rules
- Default values
- Timestamps (createdAt, updatedAt)

### Controllers
Each controller file contains:
- Create (POST) handler
- Read All (GET) handler
- Read Single (GET by ID) handler
- Update (PUT) handler
- Delete (DELETE) handler
- Validation of foreign keys

### Routes
Each route file contains:
- REST endpoint mappings
- Middleware associations (validation)
- Route parameter definitions

### Middleware
- `validation.js` - Joi schema validators for each resource type

---

## Data Models Overview

### Vehicle
```
id (string, unique) - Vehicle identifier
licensePlate (string, unique) - License plate number
fuelRate (number) - Fuel consumption in L/100km
status (enum) - idle | running | maintenance
timestamps - createdAt, updatedAt
```

### Driver
```
id (string, unique) - Driver identifier
name (string) - Driver's full name
phone (string) - Contact number
licenseNumber (string, unique) - License number
status (enum) - available | on_trip | off
timestamps - createdAt, updatedAt
```

### Order
```
id (string, unique) - Order identifier
type (enum) - IN | OUT
  OUT: Hải Phòng → A
  IN: B → Hải Phòng
location (enum) - A | B
status (enum) - pending | assigned | done
cost (number) - Order cost
timestamps - createdAt, updatedAt
```

### Trip
```
id (string, unique) - Trip identifier
vehicleId (string) - Reference to Vehicle
driverId (string) - Reference to Driver
order1Id (string) - Reference to Order (required)
order2Id (string) - Reference to Order (optional)
route (object)
  stopA (string) - Starting location
  stopB (string) - Ending location
status (enum) - planned | running | completed
cost (number) - Trip cost
timestamps - createdAt, updatedAt
```

---

## API Endpoint Summary

### Vehicles
- `POST /api/vehicles` - Create
- `GET /api/vehicles` - Get all
- `GET /api/vehicles/:id` - Get one
- `PUT /api/vehicles/:id` - Update
- `DELETE /api/vehicles/:id` - Delete

### Drivers
- `POST /api/drivers` - Create
- `GET /api/drivers` - Get all
- `GET /api/drivers/:id` - Get one
- `PUT /api/drivers/:id` - Update
- `DELETE /api/drivers/:id` - Delete

### Orders
- `POST /api/orders` - Create
- `GET /api/orders` - Get all
- `GET /api/orders/:id` - Get one
- `PUT /api/orders/:id` - Update
- `DELETE /api/orders/:id` - Delete

### Trips
- `POST /api/trips` - Create
- `GET /api/trips` - Get all
- `GET /api/trips/:id` - Get one
- `GET /api/trips/vehicle/:vehicleId` - Get by vehicle
- `GET /api/trips/driver/:driverId` - Get by driver
- `PUT /api/trips/:id` - Update
- `DELETE /api/trips/:id` - Delete

---

## Dependencies

### Production Dependencies
- **express** (4.18.2) - Web framework
- **mongoose** (7.5.0) - MongoDB ODM
- **dotenv** (16.3.1) - Environment variable management
- **jsonwebtoken** (9.0.2) - JWT authentication
- **bcryptjs** (2.4.3) - Password hashing
- **joi** (17.11.0) - Data validation
- **cors** (2.8.5) - CORS middleware
- **express-async-errors** (3.1.1) - Async error handling

### Development Dependencies
- **nodemon** (3.0.1) - Auto-restart on file changes
- **jest** (29.7.0) - Testing framework
- **supertest** (6.3.3) - HTTP assertion library

---

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI
   ```

3. **Start server:**
   ```bash
   npm run dev    # Development with hot-reload
   npm start      # Production
   ```

4. **Test API:**
   - Use Postman or REST Client extension
   - Import requests from `requests.http`
   - Or use cURL commands from `QUICKSTART.md`

---

## Project Structure Visualization

```
server/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── index.js
│   │   ├── Vehicle.js
│   │   ├── Driver.js
│   │   ├── Order.js
│   │   └── Trip.js
│   ├── controllers/
│   │   ├── vehicleController.js
│   │   ├── driverController.js
│   │   ├── orderController.js
│   │   └── tripController.js
│   ├── routes/
│   │   ├── vehicleRoutes.js
│   │   ├── driverRoutes.js
│   │   ├── orderRoutes.js
│   │   └── tripRoutes.js
│   ├── middleware/
│   │   └── validation.js
│   └── index.js
├── .env
├── .env.example
├── .gitignore
├── package.json
├── Dockerfile
├── docker-compose.yml
├── README.md
├── QUICKSTART.md
├── API_DOCUMENTATION.md
├── ENV_CONFIG.md
├── PROJECT_FILES.md
└── requests.http
```

---

## Next Steps

1. **Setup MongoDB** - Install locally or use MongoDB Atlas
2. **Install Dependencies** - Run `npm install`
3. **Configure Environment** - Update `.env` file
4. **Start Server** - Run `npm run dev`
5. **Test Endpoints** - Use Postman or REST Client
6. **Read Documentation** - Check API_DOCUMENTATION.md

---

## Support

For detailed information about:
- API endpoints: See `API_DOCUMENTATION.md`
- Environment variables: See `ENV_CONFIG.md`
- Quick setup: See `QUICKSTART.md`
- General info: See `README.md`
