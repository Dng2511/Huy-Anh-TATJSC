const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
    {
        month: {
            type: String,
            required: true,
            unique: true,
            match: /^\d{4}-\d{2}$/
        },
        dieselFees: [
            {
                date: Date,

                vehicle: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Vehicle'
                },

                quantity: Number,

                unitPrice: Number,

                amount: Number,
            }
        ],
        otherFees: [
            {
                date: Date,
                vehicle: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Vehicle'
                },
                name: String,
                amount: Number,
            }
        ]
    },
    {
        timestamps: true,
    }
);

const Fee = mongoose.model('Fee', feeSchema);

module.exports = Fee;
