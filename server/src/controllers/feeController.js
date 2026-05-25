const Fee = require('../models/Fee');

exports.getFee = async (req, res) => {
    try {
        const month = req.params.month;
        if (!/^\d{4}-\d{2}$/.test(month)) {
            return res.status(400).json({ message: 'Invalid month format. Use YYYY-MM.' });
        }
        const fee = await Fee.findOne({ month }).populate('dieselFees.vehicle').populate('otherFees.vehicle');
        if (!fee) {
            const newFee = new Fee({ month, dieselFees: [], otherFees: [] });
            await newFee.save();
            return res.json(newFee);
        }
        res.json(fee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateFee = async (req, res) => {
    try {
        const month = req.params.month;
        const {dieselFees, otherFees } = req.body;
        const fee = await Fee.findOneAndUpdate(
            { month },
            { dieselFees, otherFees },
            { new: true, upsert: true }
        );
        if (!fee) {
            return res.status(404).json({ message: 'Fee not found' });
        }
        res.json(fee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


