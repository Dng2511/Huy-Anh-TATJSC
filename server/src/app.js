import cors from 'cors'
import express from 'express'
import { requireAuth } from './middleware/authMiddleware.js'
import { authRouter } from './routes/auth.js'
import { apiRouter } from './routes/index.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/api/auth', authRouter)
  app.use('/api', requireAuth, apiRouter)

  return app
}
