const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Order = require('../models/Order');
const Driver = require('../models/Driver');
const Partner = require('../models/Partner');

async function getLogs(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 8);

  const filters = {};
  if (req.query.user) filters.user = req.query.user;
  if (req.query.action) filters.action = req.query.action;
  if (req.query.resource) filters.resource = req.query.resource;
  if (req.query.resourceId) filters.resourceId = req.query.resourceId;

  if (req.query.fromDate || req.query.toDate) {
    filters.createdAt = {};
    if (req.query.fromDate) filters.createdAt.$gte = new Date(req.query.fromDate);
    if (req.query.toDate) filters.createdAt.$lte = new Date(req.query.toDate);
  }

  const skip = (page - 1) * limit;

  const [itemsRaw, totalItems] = await Promise.all([
    AuditLog.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name username').lean(),
    AuditLog.countDocuments(filters),
  ]);

  // Normalize display name: prefer user.name, fall back to user.username, then stored userName
  const items = await Promise.all(itemsRaw.map(async (it) => {
    const userObj = it.user || null;
    const displayName = (userObj && (userObj.name || userObj.username)) || it.userName || '';

    let resourceTitle = '';
    try {
      const rid = it.resourceId || '';
      switch ((it.resource || '').toLowerCase()) {
        case 'users':
          if (rid) {
            const u = await User.findById(rid);
            resourceTitle = u ? (u.name || u.username || rid) : 'Đã xóa';
          }
          break;
        case 'vehicles':
          if (rid) {
            const v = await Vehicle.findById(rid);
            resourceTitle = v ? (v.licensePlate || rid) : 'Đã xóa';
          }
          break;
        case 'drivers':
          if (rid) {
            const d = await Driver.findById(rid);
            resourceTitle = d ? (d.name || rid) : 'Đã xóa';
          }
          break;
        case 'partners':
          if (rid) {
            const p = await Partner.findById(rid);
            resourceTitle = p ? (p.name || rid) : 'Đã xóa';
          }
          break;
        case 'orders':
          if (rid) {
            // show last 6 chars of id for orders
            resourceTitle = String(rid).slice(-6);
          }
          break;
        default:
          resourceTitle = it.resourceId || '';
      }
    } catch (err) {
      resourceTitle = it.resourceId || '';
    }

    return Object.assign({}, it, { actorName: displayName, resourceTitle });
  }));

  const totalPages = Math.ceil((totalItems || 0) / limit);

  res.json({ items, pagination: { page, limit, totalItems, totalPages } });
}

module.exports = { getLogs };
