const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { validatePartner, validateRate, validateRemoveRates } = require('../middleware/validation');
const { checkUser } = require('../middleware/checkUser');
// CRUD endpoints for partners
router.post('/', checkUser, validatePartner, partnerController.createPartner);
router.get('/', partnerController.getAllPartners);
router.put('/:id', checkUser, validatePartner, partnerController.updatePartner);
router.delete('/:id', checkUser, partnerController.deletePartner);
router.post('/:partnerId/rates', checkUser, validateRate, partnerController.addDeliveryRate);
router.delete('/:partnerId/rates', checkUser, validateRemoveRates, partnerController.removeDeliveryRate);


module.exports = router;