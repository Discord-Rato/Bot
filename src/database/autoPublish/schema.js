const mongoose = require("mongoose");

/**
 * @INFO
 * Exporting the model.
 */

module.exports = mongoose.model(
    `autoPublish-channels`,
    new mongoose.Schema({
        _id: String,
        channels: Array,
    })
);
