import { Router } from 'express'
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
import { createCrudRouter } from './createCrudRouter.js'
import { routeOptimizationRouter } from './routeOptimization.js'

export const apiRouter = Router()

apiRouter.use('/orders', createCrudRouter(Order))
apiRouter.use('/vehicles', createCrudRouter(Vehicle))
apiRouter.use('/drivers', createCrudRouter(Driver))
apiRouter.use('/trips', createCrudRouter(Trip))
apiRouter.use('/tracking', createCrudRouter(TrackingVehicle))
apiRouter.use('/inventory', createCrudRouter(Inventory))
apiRouter.use('/costs', createCrudRouter(CostRow))
apiRouter.use('/invoices', createCrudRouter(Invoice))
apiRouter.use('/users', createCrudRouter(User))
apiRouter.use('/metrics', createCrudRouter(Metric))
apiRouter.use('/route-optimizer', routeOptimizationRouter)

apiRouter.use((error, _req, res, _next) => {
  console.error(error)

  if (error?.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      details: error.message,
    })
  }

  if (error?.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid id format',
    })
  }

  return res.status(500).json({
    message: 'Internal server error',
  })
})
