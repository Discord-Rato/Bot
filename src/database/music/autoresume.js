const mongoose = require("mongoose");

module.exports = mongoose.model(
    `music_queues`,
    new mongoose.Schema({
        _id: String,
        voiceChannel: { type: String, required: true },
        textChannel: { type: String, required: true },
        songs: { type: Array, required: true },
        repeatMode: { type: Boolean, required: true, default: false },
        volume: { type: Number, required: true, default: 100 },
        playing: { type: Boolean, required: true, default: true },
        currentTime: { type: Number, required: true },
        filters: { type: Array, required: true },
        autoPlay: { type: Boolean, required: true, default: false },
    })
);
