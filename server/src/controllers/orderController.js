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
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const skip = (page - 1) * limit;

        if (req.query.partner) {
            filters.partner = req.query.partner;
        }
        if (req.query.driver) {
            filters.driver = req.query.driver;
        }

        const [orders, totalItems] = await Promise.all([
            Order.find(filters)
                .populate('partner', 'name')
                .populate('driver', 'name')
                .populate('vehicle', 'licensePlate')
                .populate('pickup', 'name')
                .populate('delivery', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments(filters)
        ]);

        res.status(200).json({
            items: orders,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
                pageSize: limit
            }
        });
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

// Delete orders (multiple)
exports.deleteOrders = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({
                error: 'ids must be an array'
            });
        }

        const result = await Order.deleteMany({
            _id: { $in: ids }
        });

        res.status(200).json({
            message: 'Orders deleted successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};