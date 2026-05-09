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
exports.deleteGate = async (req, res) => {
    try {
        const gate = await Gate.findByIdAndDelete(req.params.id);

        if (!gate) {
            return res.status(404).json({
                success: false,
                message: 'Gate not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Gate deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};