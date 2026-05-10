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

//Delete partners (multiple)
exports.deletePartners = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({
                success: false,
                message: 'ids must be an array',
            });
        }

        const result = await Partner.deleteMany({
            _id: { $in: ids }
        });

        res.status(200).json({
            success: true,
            message: 'Partners deleted successfully',
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.addDeliveryRate = async (req, res) => {
    try {
        const { partnerId } = req.params;
        const { pickup, delivery, isReefer, fixedCost } = req.body;
        const partner = await Partner.findById(partnerId);
        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found',
            });
        }
        partner.rates.push({ pickup, delivery, isReefer, fixedCost });
        await partner.save();
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

exports.removeDeliveryRate = async (req, res) => {
    try {
        const { partnerId } = req.params;
        const { pickup, delivery, isReefer } = req.body;
        const partner = await Partner.findById(partnerId);
        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found',
            });
        }
        partner.rates = partner.rates.filter(rate => {
            return !(rate.pickup.equals(pickup) && rate.delivery.equals(delivery) && rate.isReefer === isReefer);
        });
        await partner.save();
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

