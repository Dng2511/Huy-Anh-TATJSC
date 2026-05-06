## Quick Start Guide

### 1. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Then start MongoDB service

mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Update `MONGODB_URI` in `.env`

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Edit the `.env` file with your MongoDB URI and other settings.

### 4. Start the Server
```bash
npm run dev
```

You should see:
```
MongoDB Connected: localhost
Server is running on port 3000
```

### 5. Test the API

**Using cURL:**

**Create a Vehicle:**
```bash
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "id": "VH001",
    "licensePlate": "ABC123",
    "fuelRate": 8.5,
    "status": "idle"
  }'
```

**Get All Vehicles:**
```bash
curl http://localhost:3000/api/vehicles
```

**Create a Driver:**
```bash
curl -X POST http://localhost:3000/api/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "id": "DR001",
    "name": "John Doe",
    "phone": "0912345678",
    "licenseNumber": "DL123456",
    "status": "available"
  }'
```

**Create an Order:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ORD001",
    "type": "OUT",
    "location": "A",
    "status": "pending",
    "cost": 500000
  }'
```

**Create a Trip:**
```bash
curl -X POST http://localhost:3000/api/trips \
  -H "Content-Type: application/json" \
  -d '{
    "id": "TRIP001",
    "vehicleId": "VH001",
    "driverId": "DR001",
    "order1Id": "ORD001",
    "route": {
      "stopA": "Hải Phòng",
      "stopB": "Location A"
    },
    "status": "planned",
    "cost": 500000
  }'
```

### 6. Using Postman or Insomnia

Import the sample requests from `examples/requests.http` into your API client.

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check the `MONGODB_URI` in `.env` is correct
- For MongoDB Atlas, ensure your IP is whitelisted

**Port Already in Use**
- Change the `PORT` in `.env`
- Or kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -i :3000
  kill -9 <PID>
  ```

**Dependencies Installation Failed**
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
