const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const { checkUser } = require('../middleware/checkUser');
const { validateFee } = require('../middleware/validation');

router.get('/:month', feeController.getFee);
router.put('/:month', checkUser, validateFee, feeController.updateFee);

module.exports = router;