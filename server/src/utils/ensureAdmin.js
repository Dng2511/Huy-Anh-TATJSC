const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');

function generatePassword(len = 12) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
}

async function ensureAdmin() {
  try {
    const anyUser = await User.findOne();
    if (anyUser) return;

    const username = process.env.ADMIN_USERNAME || 'admin';
    const rawPassword = process.env.ADMIN_PASSWORD || generatePassword(12);

    const hashed = await bcrypt.hash(rawPassword, 10);
    const user = new User({ name: 'Admin', username, password: hashed, role: 'admin' });
    await user.save();

    console.log('Created admin user:');
    console.log(`  username: ${username}`);
    console.log(`  password: ${process.env.ADMIN_PASSWORD ? '(from env)' : rawPassword}`);
  } catch (err) {
    console.error('ensureAdmin error:', err);
  }
}

module.exports = ensureAdmin;
