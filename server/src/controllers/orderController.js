const Order = require('../models/Order');
const Vehicle = require('../models/Vehicle');
const { getTrackingData } = require('./vehicleController');

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
                orderDate,
                cost,
                waitingCost
            } = req.body;

            // Validate bắt buộc
            if (!pickup || !delivery) {
                return res.status(400).json({
                    error: 'Pickup and delivery are required'
                });
            }

            if (status !== 'planned' && !vehicle) {
                return res.status(400).json({
                    error: 'Vehicle is required for non-planned orders'
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
                orderDate,
                cost,
                waitingCost
            });

            if (order.vehicle) {
                await Vehicle.findByIdAndUpdate(order.vehicle, {
                    status: vehicleStatus
                });
            }


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
            if (req.query.vehicle) {
                filters.vehicle = req.query.vehicle;
            }

            if (req.query.status) {
                filters.status = req.query.status;
            }

            const statusOrder = [
                'planned',
                'confirmed',
                'running',
                'waiting',
                'delivering',
                'unloading',
                'completed',
                'cancelled',
            ];

            const [orders, totalItems] = await Promise.all([
                Order.aggregate([
                    {
                        $match: filters,
                    },

                    {
                        $addFields: {
                            statusOrder: {
                                $indexOfArray: [statusOrder, '$status'],
                            },
                        },
                    },

                    {
                        $sort: {
                            statusOrder: 1,
                            createdAt: -1,
                        },
                    },

                    {
                        $skip: skip,
                    },

                    {
                        $limit: limit,
                    },

                    // partner
                    {
                        $lookup: {
                            from: 'partners',
                            localField: 'partner',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        name: 1,
                                    },
                                },
                            ],
                            as: 'partner',
                        },
                    },
                    {
                        $unwind: {
                            path: '$partner',
                            preserveNullAndEmptyArrays: true,
                        },
                    },

                    // driver
                    {
                        $lookup: {
                            from: 'drivers',
                            localField: 'driver',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        name: 1,
                                    },
                                },
                            ],
                            as: 'driver',
                        },
                    },
                    {
                        $unwind: {
                            path: '$driver',
                            preserveNullAndEmptyArrays: true,
                        },
                    },

                    // vehicle
                    {
                        $lookup: {
                            from: 'vehicles',
                            localField: 'vehicle',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        licensePlate: 1,
                                        status: 1,
                                    },
                                },
                            ],
                            as: 'vehicle',
                        },
                    },
                    {
                        $unwind: {
                            path: '$vehicle',
                            preserveNullAndEmptyArrays: true,
                        },
                    },

                    // pickup
                    {
                        $lookup: {
                            from: 'gates',
                            localField: 'pickup',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        name: 1,
                                    },
                                },
                            ],
                            as: 'pickup',
                        },
                    },
                    {
                        $unwind: '$pickup',
                    },

                    // delivery
                    {
                        $lookup: {
                            from: 'gates',
                            localField: 'delivery',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        name: 1,
                                    },
                                },
                            ],
                            as: 'delivery',
                        },
                    },
                    {
                        $unwind: '$delivery',
                    },

                    {
                        $project: {
                            statusOrder: 0,
                        },
                    },
                ]),

                Order.countDocuments(filters),
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
                orderDate,
                cost,
                waitingCost
            } = req.body;
            const order = await Order.findById(req.params.id);
            if (!order) {
                return res.status(404).json({
                    error: 'Order not found'
                });
            }

            if (status !== 'planned' && !vehicle) {
                return res.status(400).json({
                    error: 'Vehicle is required for non-planned orders'
                });
            }

            const previousStatus = order.status;
            const newStatus = status !== undefined ? status : previousStatus;

            order.partner = partner === undefined ? order.partner : partner;
            order.driver = driver === undefined ? null : driver;
            order.vehicle = vehicle === undefined ? null : vehicle;
            order.pickup = pickup === undefined ? order.pickup : pickup;
            order.delivery = delivery === undefined ? order.delivery : delivery;
            order.isReefer = isReefer === undefined ? order.isReefer : isReefer;
            order.status = newStatus;
            order.orderDate = orderDate === undefined ? order.orderDate : orderDate;
            order.cost = cost === undefined ? order.cost : cost;
            order.waitingCost = waitingCost === undefined ? order.waitingCost : waitingCost;

            // If changing from non-waiting -> waiting: set waitingStart to today
            if (previousStatus !== 'waiting' && newStatus === 'waiting') {
                order.waitingStart = new Date();
                // clear waitingEnd when entering waiting again
                order.waitingEnd = undefined;
            }

            // If changing from waiting -> non-waiting: set waitingEnd to today
            if (previousStatus === 'waiting' && newStatus !== 'waiting') {
                order.waitingEnd = new Date();
            }

            await order.save();

            const populated = await Order.findById(order._id)
                .populate('partner', 'name')
                .populate('driver', 'name')
                .populate('vehicle', 'licensePlate')
                .populate('pickup', 'name')
                .populate('delivery', 'name');

            res.status(200).json(populated);
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