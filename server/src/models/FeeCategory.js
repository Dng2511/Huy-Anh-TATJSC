const mongoose = require('mongoose');

const feeCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        }
    },
    {
        timestamps: true,
    }
);