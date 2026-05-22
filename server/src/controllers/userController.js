const bcrypt = require('bcryptjs');
const User = require('../models/User');

function toSafeUser(user) {
  if (!user) {
    return null;
  }

  const safeUser = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete safeUser.password;
  return safeUser;
}

exports.getAllUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '8', 10), 1);
    const search = String(req.query.search || '').trim();
    const role = String(req.query.role || '').trim();

    const filters = {};
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) {
      filters.role = role;
    }

    const [items, totalItems] = await Promise.all([
      User.find(filters)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filters),
    ]);

    res.json({
      items: items.map(toSafeUser),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, username, password, role = 'user' } = req.body || {};

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      username,
      password: hashedPassword,
      role,
    });

    await user.save();
    res.status(201).json(toSafeUser(user));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, username, password, role } = req.body || {};
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      user.username = username;
    }

    if (name) {
      user.name = name;
    }

    if (typeof role === 'string' && role) {
      user.role = role;
    }

    if (typeof password === 'string' && password.trim()) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.json(toSafeUser(user));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUsers = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids must be a non-empty array' });
    }

    const result = await User.deleteMany({ _id: { $in: ids } });

    res.json({
      message: 'Users deleted successfully',
      deletedCount: result.deletedCount || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

