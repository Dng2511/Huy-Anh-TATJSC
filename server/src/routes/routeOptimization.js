import { Router } from 'express'

export const routeOptimizationRouter = Router()

routeOptimizationRouter.post('/optimize', async (req, res, next) => {
  try {
    const optimizerUrl = process.env.ROUTE_OPTIMIZER_URL || 'http://127.0.0.1:8000'
    const response = await fetch(`${optimizerUrl}/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    })

    const payload = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(payload)
    }

    return res.json(payload)
  } catch (error) {
    return next(error)
  }
})
