const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema(
    {
        pickup: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gate',
            required: true,
        },

        delivery: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gate',
            required: true,
        },

        isReefer: {
            type: Boolean,
            default: false,
        },

        fixedCost: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        _id: false,
    }
);

const partnerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        contact: {
            phone: {
                type: String,
                required: true,
                trim: true,
            },

            email: {
                type: String,
                required: false,
                trim: true,
            },
        },
        rates: [rateSchema],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Partner', partnerSchema);