const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { validatePartner } = require('../middleware/validation');
// CRUD endpoints for partners
router.post('/', validatePartner, partnerController.createPartner);
router.get('/', partnerController.getAllPartners);
router.put('/:id', validatePartner, partnerController.updatePartner);
router.delete('/', partnerController.deletePartners);

module.exports = router;