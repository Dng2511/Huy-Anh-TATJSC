# File Reference Guide

## Complete File Listing

### Root Directory Files (13 files)

| File | Purpose | Type |
|------|---------|------|
| `package.json` | NPM dependencies and scripts | Config |
| `.env` | Local environment variables | Config |
| `.env.example` | Template for environment variables | Config |
| `.gitignore` | Git ignore patterns | Config |
| `Dockerfile` | Docker image build configuration | Deployment |
| `docker-compose.yml` | Docker Compose multi-container setup | Deployment |
| `requests.http` | REST Client / Postman requests | Testing |
| `README.md` | Main project documentation | Docs |
| `QUICKSTART.md` | Quick setup and testing guide | Docs |
| `API_DOCUMENTATION.md` | Complete API endpoint reference | Docs |
| `ENV_CONFIG.md` | Environment variables guide | Docs |
| `PROJECT_FILES.md` | Overview of all project files | Docs |
| `ARCHITECTURE.md` | System architecture diagrams | Docs |
| `IMPLEMENTATION_SUMMARY.md` | What was created and how to use | Docs |

### Source Code (`src/` - 22 files)

#### Main Entry Point (1 file)
| File | Purpose |
|------|---------|
| `src/index.js` | Express server initialization |

#### Configuration (`src/config/` - 1 file)
| File | Purpose |
|------|---------|
| `src/config/database.js` | MongoDB connection setup |

#### Models (`src/models/` - 5 files)
| File | Purpose |
|------|---------|
| `src/models/Vehicle.js` | Vehicle MongoDB schema |
| `src/models/Driver.js` | Driver MongoDB schema |
| `src/models/Order.js` | Order MongoDB schema |
| `src/models/Trip.js` | Trip MongoDB schema |
| `src/models/index.js` | Model exports barrel |

#### Controllers (`src/controllers/` - 4 files)
| File | Purpose |
|------|---------|
| `src/controllers/vehicleController.js` | Vehicle CRUD operations |
| `src/controllers/driverController.js` | Driver CRUD operations |
| `src/controllers/orderController.js` | Order CRUD operations |
| `src/controllers/tripController.js` | Trip CRUD operations + filtering |

#### Routes (`src/routes/` - 4 files)
| File | Purpose |
|------|---------|
| `src/routes/vehicleRoutes.js` | Vehicle API endpoints |
| `src/routes/driverRoutes.js` | Driver API endpoints |
| `src/routes/orderRoutes.js` | Order API endpoints |
| `src/routes/tripRoutes.js` | Trip API endpoints |

#### Middleware (`src/middleware/` - 1 file)
| File | Purpose |
|------|---------|
| `src/middleware/validation.js` | Joi validation middleware |

---

## File Dependencies Map

### Entry Point Dependencies
```
src/index.js
├── src/config/database.js
├── src/routes/vehicleRoutes.js
│   └── src/controllers/vehicleController.js
│       └── src/models/Vehicle.js
├── src/routes/driverRoutes.js
│   └── src/controllers/driverController.js
│       └── src/models/Driver.js
├── src/routes/orderRoutes.js
│   └── src/controllers/orderController.js
│       └── src/models/Order.js
└── src/routes/tripRoutes.js
    └── src/controllers/tripController.js
        ├── src/models/Trip.js
        ├── src/models/Vehicle.js
        ├── src/models/Driver.js
        └── src/models/Order.js
```

### Middleware Dependencies
```
All Routes
└── src/middleware/validation.js
    └── Joi (external package)
```

---

## Quick File Lookup

### Need to...
| Task | File to Check |
|------|---------------|
| **Setup/Installation** | `README.md`, `QUICKSTART.md` |
| **API Endpoints** | `API_DOCUMENTATION.md` |
| **Environment Variables** | `ENV_CONFIG.md`, `.env.example` |
| **Architecture Overview** | `ARCHITECTURE.md` |
| **File Structure** | `PROJECT_FILES.md` |
| **What Was Built** | `IMPLEMENTATION_SUMMARY.md` |
| **Test API Calls** | `requests.http` |
| **Start Development** | `QUICKSTART.md` |
| **Deploy with Docker** | `Dockerfile`, `docker-compose.yml` |
| **Change Dependencies** | `package.json` |
| **Add a New Vehicle** | `src/controllers/vehicleController.js` |
| **Modify Vehicle Data** | `src/models/Vehicle.js` |
| **Add Vehicle Route** | `src/routes/vehicleRoutes.js` |
| **Validate Input** | `src/middleware/validation.js` |
| **Connect to Database** | `src/config/database.js` |

---

## File Editing Guide

### For Developers

#### Adding a New Field to Vehicle
1. Edit: `src/models/Vehicle.js` - Add field to schema
2. Edit: `src/middleware/validation.js` - Update vehicleSchema
3. Test: Use `requests.http` to verify

#### Adding a New Route
1. Create/Edit: `src/routes/*Routes.js` - Add route
2. Create/Edit: `src/controllers/*Controller.js` - Add handler
3. Test: Add request to `requests.http`

#### Fixing a Bug
1. Identify issue in error logs
2. Find relevant file (controller or model)
3. Make fix
4. Test with `requests.http`
5. Verify with cURL or Postman

#### Deploying to Production
1. Update environment variables in `.env`
2. Set `NODE_ENV=production`
3. Use `docker-compose.yml` or manual deployment
4. Test all endpoints

### For DevOps

#### Docker Deployment
- Modify: `Dockerfile` - Change build process
- Modify: `docker-compose.yml` - Add services
- Use: `docker-compose up` to deploy

#### Environment Setup
- Create `.env` from `.env.example`
- Configure: `MongoDB URI`, `PORT`, `JWT_SECRET`
- Run: `npm install && npm start`

#### Monitoring
- Check logs: `npm run dev` console output
- Monitor: Database connection status
- Test: `GET /health` endpoint

---

## Common Code Locations

### Add New CRUD Operation
📁 `src/controllers/` - Add handler function

### Add API Validation
📁 `src/middleware/validation.js` - Add Joi schema

### Add New Model
📁 `src/models/` - Create new schema file

### Add New Route
📁 `src/routes/` - Create new routes file

### Configure Database
📁 `src/config/database.js` - Update connection

### Configure Environment
📄 `.env` - Add new variables

---

## Documentation File Purposes

| Document | When to Read |
|----------|--------------|
| `README.md` | First time setup, project overview |
| `QUICKSTART.md` | Quick start in 5 minutes |
| `API_DOCUMENTATION.md` | When developing API client |
| `ENV_CONFIG.md` | When setting up environments |
| `PROJECT_FILES.md` | Need to find a specific file |
| `ARCHITECTURE.md` | Understanding system design |
| `IMPLEMENTATION_SUMMARY.md` | What's available in this project |
| `FILE_REFERENCE.md` | This file - quick lookup |

---

## Total File Count

| Category | Count |
|----------|-------|
| Configuration Files | 4 |
| Documentation Files | 8 |
| Docker/Deployment | 2 |
| Testing/Examples | 1 |
| Source Code | 15 |
| **TOTAL** | **30 files** |

---

## Development Workflow

### Morning Setup
```
1. Read: QUICKSTART.md
2. Run: npm install
3. Create: .env file
4. Start: npm run dev
5. Test: requests.http
```

### Adding Feature
```
1. Design: Schema in Models
2. Implement: Controller logic
3. Route: Add to Routes
4. Validate: Middleware validation
5. Test: requests.http
6. Document: API_DOCUMENTATION.md
```

### Debugging
```
1. Check: Console logs from npm run dev
2. Find: Relevant controller/model file
3. Review: API_DOCUMENTATION.md for expected behavior
4. Test: requests.http with specific data
5. Fix: Update code
6. Verify: Test again
```

### Deployment
```
1. Update: ENV_CONFIG.md values for production
2. Prepare: Docker with docker-compose.yml
3. Deploy: docker-compose up
4. Verify: Test all endpoints
5. Monitor: Check logs and /health endpoint
```

---

## File Size Reference

```
Configuration Files (~2KB)
├── package.json
├── .env
├── .env.example
└── .gitignore

Documentation Files (~50KB)
├── README.md
├── QUICKSTART.md
├── API_DOCUMENTATION.md
├── ENV_CONFIG.md
├── PROJECT_FILES.md
├── ARCHITECTURE.md
├── IMPLEMENTATION_SUMMARY.md
└── FILE_REFERENCE.md

Source Code (~40KB)
├── src/index.js
├── src/config/database.js
├── src/models/ (5 files)
├── src/controllers/ (4 files)
├── src/routes/ (4 files)
└── src/middleware/validation.js

Deployment (~2KB)
├── Dockerfile
└── docker-compose.yml

Testing (~3KB)
└── requests.http

TOTAL: ~97KB (very lightweight!)
```

---

## Key File Relationships

### Request Flow
```
HTTP Request
    ↓
routes/*.js (maps URL to controller)
    ↓
middleware/validation.js (validates input)
    ↓
controllers/*Controller.js (business logic)
    ↓
models/*.js (MongoDB schema)
    ↓
MongoDB (stores data)
    ↓
Response (JSON back to client)
```

### Database Relations
```
vehicles collection
    ↑
    └─ referenced by trips.vehicleId

drivers collection
    ↑
    └─ referenced by trips.driverId

orders collection
    ↑
    ├─ referenced by trips.order1Id
    └─ referenced by trips.order2Id

trips collection
    └─ references vehicles, drivers, orders
```

---

## Editing Checklist

When making changes, verify:

- [ ] File saved successfully
- [ ] Syntax is valid (no red underlines)
- [ ] Related files are updated
- [ ] Test with requests.http
- [ ] API still returns 200 OK responses
- [ ] No breaking changes to existing endpoints
- [ ] Documentation updated if needed
- [ ] Git changes review if using version control

---

## Next Files to Create

Future enhancements would add files in:

```
src/
├── tests/          # Unit and integration tests
├── utils/          # Helper functions
├── constants/      # Application constants
├── errors/         # Custom error classes
└── logger/         # Logging configuration
```

---

For more information on any file, see the corresponding documentation in the root directory.
