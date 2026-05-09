const Partner = require('../models/Partner');

// Create a new partner
exports.createPartner = async (req, res) => {
    try {
        const { name, contactInfo, rates, waitingCost } = req.body;

        const partner = await Partner.create({
            name,
            contactInfo,
            rates,
            waitingCost,
        });

        res.status(201).json({
            success: true,
            data: partner,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all partners
exports.getAllPartners = async (req, res) => {
    try {
        const partners = await Partner.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: partners.length,
            data: partners,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update a partner
exports.updatePartner = async (req, res) => {
    try {
        const partner = await Partner.findByIdAndUpdate(
            req.params.id,
            req.body, {
            new: true,
            runValidators: true,
        }
        );
        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found',
            });
        }
        res.status(200).json({
            success: true,
            data: partner,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//Delete a partner
exports.deletePartner = async (req, res) => {
    try {
        const partner = await Partner.findByIdAndDelete(req.params.id);
        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found',
            });
        }
        res.status(200).json({
            success: true,
            message: 'Partner deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false, 
            message: error.message,
        });
    }
};
