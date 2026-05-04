import { Router } from 'express'
import { User } from '../models/User.js'

export function createCrudRouter(Model) {
  const router = Router()

  router.get('/', async (_req, res, next) => {
    try {
      const query = Model.find().sort({ createdAt: -1 })
      // exclude sensitive fields for users
      if (Model.modelName === 'User') {
        query.select('-passwordHash')
      }
      const rows = await query
      res.json(rows)
    } catch (error) {
      next(error)
    }
  })

  router.get('/:id', async (req, res, next) => {
    try {
      let query = Model.findById(req.params.id)
      if (Model.modelName === 'User') {
        query = query.select('-passwordHash')
      }
      const row = await query
      if (!row) {
        return res.status(404).json({ message: 'Not found' })
      }

      res.json(row)
    } catch (error) {
      next(error)
    }
  })

  router.post('/', async (req, res, next) => {
    try {
      const payload = { ...req.body }
      if (Model.modelName === 'User' && payload.password) {
        payload.passwordHash = await User.hashPassword(payload.password)
        delete payload.password
      }
      const row = await Model.create(payload)
      const out = row.toObject()
      if (Model.modelName === 'User') delete out.passwordHash
      res.status(201).json(out)
    } catch (error) {
      next(error)
    }
  })

  router.put('/:id', async (req, res, next) => {
    try {
      const update = { ...req.body }
      if (Model.modelName === 'User' && update.password) {
        update.passwordHash = await User.hashPassword(update.password)
        delete update.password
      }

      let query = Model.findByIdAndUpdate(req.params.id, update, {
        new: true,
        runValidators: true,
      })
      if (Model.modelName === 'User') query = query.select('-passwordHash')
      const row = await query

      if (!row) {
        return res.status(404).json({ message: 'Not found' })
      }

      res.json(row)
    } catch (error) {
      next(error)
    }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      const row = await Model.findByIdAndDelete(req.params.id)
      if (!row) {
        return res.status(404).json({ message: 'Not found' })
      }

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  })

  return router
}
