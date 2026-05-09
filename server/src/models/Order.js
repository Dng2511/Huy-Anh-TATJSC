const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        partner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Partner',
            required: false,
        },
        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Driver',
            required: false,
        },
        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: false,
        },
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
        status: {
            type: String,
            enum: ['planned', 'running', 'waiting' ,'delivering', 'completed', 'cancelled'],
            default: 'planned'
        },
        cost: {
            type: Number,
            default: 0
        },
        waitingStart: {
            type: Date,
            required: false,
        },
        waitingEnd: {
            type: Date,
            required: false,
        },
        waitingCost: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);