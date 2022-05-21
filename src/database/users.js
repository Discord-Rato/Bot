const mongoose = require("mongoose");

/**
 * @INFO
 * Exporting the model.
 */

module.exports = mongoose.model(
    `users`,
    new mongoose.Schema({
        _id: String,
        bio: String,
        coins: { type: Number, default: 0 },
        banked: { type: Number, default: 0 },
        daily_streeks: { type: Number, default: 0 },
        multiplier: { type: Number, default: 2 },
        Items: Object,
        transactions: Array,
        followers: Array,
        following: Array,
        blocked: Array,
    })
);
