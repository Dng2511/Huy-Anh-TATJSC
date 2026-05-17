const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Session = require('../models/Session');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_env';
const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES_DAYS = parseInt(process.env.REFRESH_EXPIRES_DAYS || '30', 10); // default 30 days

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function signAccessToken(user) {
  return jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}

function setRefreshCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  });
}

exports.login = async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = signAccessToken(user);

  // create refresh token and session
  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  const session = new Session({
    user: user._id,
    tokenHash,
    userAgent: req.get('user-agent') || '',
    ip: req.ip,
    expiresAt,
  });
  await session.save();

  setRefreshCookie(res, refreshToken);

  const userSafe = user.toObject();
  delete userSafe.password;

  res.json({ accessToken, user: userSafe });
};

exports.refresh = async (req, res) => {
  try {
    const token = req.cookies && req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    const tokenHash = hashToken(token);
    const session = await Session.findOne({ tokenHash }).populate('user');
    if (!session || session.revoked) return res.status(401).json({ error: 'Invalid refresh token' });
    if (session.expiresAt < new Date()) return res.status(401).json({ error: 'Refresh token expired' });

    // rotate: create new refresh token and revoke old session
    const newRefresh = generateRefreshToken();
    const newHash = hashToken(newRefresh);
    const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

    const newSession = new Session({
      user: session.user._id,
      tokenHash: newHash,
      userAgent: req.get('user-agent') || '',
      ip: req.ip,
      expiresAt,
    });
    await newSession.save();

    session.revoked = true;
    session.replacedBy = newSession._id;
    await session.save();

    setRefreshCookie(res, newRefresh);

    const accessToken = signAccessToken(session.user);
    const userSafe = session.user.toObject();
    delete userSafe.password;

    res.json({ accessToken, user: userSafe });
  } catch (err) {
    console.error('refresh error', err);
    res.status(500).json({ error: 'Internal error' });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies && req.cookies.refreshToken;
    if (token) {
      const tokenHash = hashToken(token);
      const session = await Session.findOne({ tokenHash });
      if (session) {
        session.revoked = true;
        await session.save();
      }
    }

    // clear cookie
    res.clearCookie('refreshToken');
    res.json({ ok: true });
  } catch (err) {
    console.error('logout error', err);
    res.status(500).json({ error: 'Internal error' });
  }
};


