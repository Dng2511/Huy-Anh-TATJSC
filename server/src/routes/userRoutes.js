const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController');
const { checkUser } = require('../middleware/checkUser');
const { validateUserCreate, validateUserUpdate } = require('../middleware/validation');

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
}

router.use(requireAdmin);

router.get('/', userController.getAllUsers);
router.post('/', checkUser, validateUserCreate, userController.createUser);
router.put('/:id', checkUser, validateUserUpdate, userController.updateUser);
router.delete('/', checkUser, userController.deleteUsers);

module.exports = router;