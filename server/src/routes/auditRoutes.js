const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

router.use(requireAdmin);

// GET /api/audit?{page,limit,user,action,resource,fromDate,toDate}
router.get('/', auditController.getLogs);

module.exports = router;
