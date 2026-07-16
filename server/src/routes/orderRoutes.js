const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validateOrder } = require('../middleware/validation');
const { checkUser } = require('../middleware/checkUser');

// CRUD endpoints for orders
router.post('/', checkUser, validateOrder, orderController.createOrder);
router.get('/', orderController.getAllOrders);
router.get('/get-orders-for-timeline', orderController.getOrdersForTimeLine);
router.get('/:id', orderController.getOrderById);
router.put('/:id', checkUser, validateOrder, orderController.updateOrder);
router.delete('/', checkUser, orderController.deleteOrders);


module.exports = router;