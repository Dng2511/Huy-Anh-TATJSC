const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { validatePartner, validateRate, validateRemoveRates } = require('../middleware/validation');
// CRUD endpoints for partners
router.post('/', validatePartner, partnerController.createPartner);
router.get('/', partnerController.getAllPartners);
router.put('/:id', validatePartner, partnerController.updatePartner);
router.delete('/:id', partnerController.deletePartner);
router.post('/:partnerId/rates', validateRate, partnerController.addDeliveryRate);
router.delete('/:partnerId/rates', validateRemoveRates, partnerController.removeDeliveryRate);


module.exports = router;