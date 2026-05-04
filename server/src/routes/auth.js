import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

export const authRouter = Router()

authRouter.post('/login', async (req, res, next) => {
  try {
    const { username, email, password } = req.body || {}

    if (!(password && (email || username))) {
      return res.status(400).json({ message: 'email/username and password are required' })
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      return res.status(500).json({ message: 'Server auth is not configured' })
    }

    const query = email ? { email } : { name: username }
    const user = await User.findOne(query).select('+passwordHash')
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const valid = await user.verifyPassword(password)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, secret, {
      expiresIn: '8h',
    })

    const out = user.toObject()
    delete out.passwordHash

    return res.json({ token, user: out })
  } catch (error) {
    next(error)
  }
})
