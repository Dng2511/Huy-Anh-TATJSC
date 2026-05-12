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
        // accept either an array of rates in the body or a single rate object
        let ratesToRemove = [];
        if (Array.isArray(req.body)) {
            ratesToRemove = req.body;
        } else if (Array.isArray(req.body.rates)) {
            ratesToRemove = req.body.rates;
        } else if (req.body && (req.body.pickup || req.body.delivery)) {
            const { pickup, delivery, isReefer } = req.body;
            ratesToRemove = [{ pickup, delivery, isReefer }];
        }

        if (!ratesToRemove.length) {
            return res.status(400).json({
                success: false,
                message: 'No rates provided to remove',
            });
        }
        const partner = await Partner.findById(partnerId);
        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found',
            });
        }
        const removeSet = new Set(
            ratesToRemove.map(r => `${r.pickup}_${r.delivery}_${!!r.isReefer}`)
        );

        partner.rates = partner.rates.filter(rate => {
            const key = `${rate.pickup.toString()}_${rate.delivery.toString()}_${!!rate.isReefer}`;
            return !removeSet.has(key);
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

