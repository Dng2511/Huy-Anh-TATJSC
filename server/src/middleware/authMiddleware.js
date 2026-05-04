import jwt from 'jsonwebtoken'

function getTokenFromHeader(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') {
    return null
  }

  const [scheme, token] = authHeader.split(' ')
  if (scheme !== 'Bearer' || !token) {
    return null
  }

  return token
}

export function requireAuth(req, res, next) {
  const token = getTokenFromHeader(req.headers.authorization)
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: missing token' })
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res.status(500).json({ message: 'Server auth is not configured' })
  }

  try {
    const payload = jwt.verify(token, secret)
    req.user = payload
    return next()
  } catch (_error) {
    return res.status(401).json({ message: 'Unauthorized: invalid token' })
  }
}
