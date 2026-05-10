const Gate = require('../models/Gate');

// CREATE
exports.createGate = async (req, res) => {
    try {
        const { name, locate, location } = req.body;

        const gate = await Gate.create({
            name,
            locate,
            location,
        });

        res.status(201).json({
            success: true,
            data: gate,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET ALL
exports.getAllGates = async (req, res) => {
    try {
        const gates = await Gate.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: gates.length,
            data: gates,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// UPDATE
exports.updateGate = async (req, res) => {
    try {
        const gate = await Gate.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!gate) {
            return res.status(404).json({
                success: false,
                message: 'Gate not found',
            });
        }

        res.status(200).json({
            success: true,
            data: gate,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// DELETE
exports.deleteGates = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({
                success: false,
                message: 'ids must be an array',
            });
        }

        const result = await Gate.deleteMany({
            _id: { $in: ids }
        });

        res.status(200).json({
            success: true,
            message: 'Gates deleted successfully',
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};