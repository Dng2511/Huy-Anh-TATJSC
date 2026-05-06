# Logistics Management API Server

A Node.js API server for managing vehicles, drivers, orders, and trips in a logistics system.

## Features

- **Vehicle Management**: Create, read, update, delete vehicles with tracking of status and fuel consumption
- **Driver Management**: Manage drivers with license and status tracking
- **Order Management**: Handle orders with location and cost information
- **Trip Management**: Create and manage trips that link vehicles, drivers, and orders
- **MongoDB Integration**: Persistent data storage using MongoDB
- **RESTful API**: Clean and intuitive REST endpoints
- **Error Handling**: Comprehensive error handling and validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the project root with the following variables:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/logistics
   JWT_SECRET=your_jwt_secret_key_here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=password
   ROUTE_OPTIMIZER_URL=http://localhost:5000
   ```

3. **Start the server:**
   ```bash
   npm run dev  # Development mode with hot-reload
   npm start    # Production mode
   ```

The server will start on the configured PORT (default: 3000).

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Vehicles
- `POST /api/vehicles` - Create a new vehicle
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get a specific vehicle
- `PUT /api/vehicles/:id` - Update a vehicle
- `DELETE /api/vehicles/:id` - Delete a vehicle

**Vehicle Model:**
```json
{
  "id": "VH001",
  "licensePlate": "ABC123",
  "fuelRate": 8.5,
  "status": "idle"
}
```

### Drivers
- `POST /api/drivers` - Create a new driver
- `GET /api/drivers` - Get all drivers
- `GET /api/drivers/:id` - Get a specific driver
- `PUT /api/drivers/:id` - Update a driver
- `DELETE /api/drivers/:id` - Delete a driver

**Driver Model:**
```json
{
  "id": "DR001",
  "name": "John Doe",
  "phone": "0912345678",
  "licenseNumber": "DL123456",
  "status": "available"
}
```

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get a specific order
- `PUT /api/orders/:id` - Update an order
- `DELETE /api/orders/:id` - Delete an order

**Order Model:**
```json
{
  "id": "ORD001",
  "type": "OUT",
  "location": "A",
  "status": "pending",
  "cost": 500000
}
```

Order Types:
- `OUT`: Hải Phòng → A
- `IN`: B → Hải Phòng

### Trips
- `POST /api/trips` - Create a new trip
- `GET /api/trips` - Get all trips
- `GET /api/trips/:id` - Get a specific trip
- `PUT /api/trips/:id` - Update a trip
- `DELETE /api/trips/:id` - Delete a trip
- `GET /api/trips/vehicle/:vehicleId` - Get trips by vehicle
- `GET /api/trips/driver/:driverId` - Get trips by driver

**Trip Model:**
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
  "cost": 1000000
}
```

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

## Project Structure

```
src/
├── config/
│   └── database.js          # MongoDB connection configuration
├── models/
│   ├── Vehicle.js           # Vehicle schema
│   ├── Driver.js            # Driver schema
│   ├── Order.js             # Order schema
│   └── Trip.js              # Trip schema
├── controllers/
│   ├── vehicleController.js # Vehicle CRUD logic
│   ├── driverController.js  # Driver CRUD logic
│   ├── orderController.js   # Order CRUD logic
│   └── tripController.js    # Trip CRUD logic
├── routes/
│   ├── vehicleRoutes.js     # Vehicle endpoints
│   ├── driverRoutes.js      # Driver endpoints
│   ├── orderRoutes.js       # Order endpoints
│   └── tripRoutes.js        # Trip endpoints
└── index.js                 # Main server file
```

## Error Handling

The API returns appropriate HTTP status codes:
- `201 Created` - Successful creation
- `200 OK` - Successful read/update
- `400 Bad Request` - Invalid input or duplicate entry
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error responses include a message explaining the issue:
```json
{
  "error": "Description of the error"
}
```

## Database Relationships

- **Vehicle - Trip**: One-to-Many (1 vehicle can have multiple trips)
- **Driver - Trip**: One-to-Many (1 driver can have multiple trips)
- **Order - Trip**: Many-to-One (Maximum 2 orders per trip)

## Future Enhancements

- JWT authentication
- Input validation using Joi
- Route optimization integration
- Pagination for list endpoints
- Filtering and sorting capabilities
- Unit and integration tests
- API documentation with Swagger

## License

ISC

## Support

For issues or questions, please create an issue in the project repository.
