const mongoose = require('mongoose');

const gateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        locate: {
            lat: Number,
            lng: Number,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Gate', gateSchema);