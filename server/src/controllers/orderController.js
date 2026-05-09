const Order = require('../models/Order');

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const {
            partner,
            driver,
            vehicle,
            pickup,
            delivery,
            isReefer,
            status,
            cost,
            waitingCost
        } = req.body;

        // Validate bắt buộc
        if (!pickup || !delivery) {
            return res.status(400).json({
                error: 'Pickup and delivery are required'
            });
        }

        // Tạo order
        const order = await Order.create({
            partner,
            driver,
            vehicle,
            pickup,
            delivery,
            isReefer,
            status,
            cost,
            waitingCost
        });


        res.status(201).json(order);

    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const filters = {};

        if (req.query.partner) {
            filters.partner = req.query.partner;
        }
        if (req.query.driver) {
            filters.driver = req.query.driver;
        }

        const orders = await Order.find(filters)
            .populate('partner', 'name')
            .populate('driver', 'name')
            .populate('vehicle', 'licensePlate')
            .populate('pickup', 'name')
            .populate('delivery', 'name');

        res.status(200).json(orders);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('partner', 'name')
            .populate('driver', 'name')
            .populate('vehicle', 'licensePlate')
            .populate('pickup', 'name')
            .populate('delivery', 'name');
        if (!order) {
            return res.status(404).json({
                error: 'Order not found'
            });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

// Update an order
exports.updateOrder = async (req, res) => {
    try {
        const {
            partner,
            driver,
            vehicle,
            pickup,
            delivery,
            isReefer,
            status,
            cost,
            waitingCost
        } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id, {
                partner,
                driver,
                vehicle,
                pickup,
                delivery,
                isReefer,
                status,
                cost,
                waitingCost
            }, {
                new: true,
                runValidators: true
            }
        ).populate('partner', 'name')
            .populate('driver', 'name')
            .populate('vehicle', 'licensePlate')
            .populate('pickup', 'name')
            .populate('delivery', 'name');
        if (!order) {
            return res.status(404).json({
                error: 'Order not found'
            });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({
                error: 'Order not found'
            });
        }
        res.status(200).json({
            message: 'Order deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};