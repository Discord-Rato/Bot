const mongoose = require("mongoose");

module.exports = mongoose.model(
    `guilds`,
    new mongoose.Schema({
        _id: String,
        description: String,
        votes: Number,
        ignoredChannels: Array,
        blacklistedChannels: Array,

        // Music Module
        requestsChannel: String,
        RequestChannelMainMsg: String,

        // Language
        language: { type: String, required: true, default: "en" },

        // Suggestions Module.
        suggestionsToggle: Boolean,
        suggestionsChannel: String,
        approvedChannel: String,
        deniedChannel: String,

        // Moderation Module
        moderationToggle: Boolean,
        blacklistedWords: Array,
        modLogs: String,

        // Commands Module
        disabledCommands: Array,
    })
);
