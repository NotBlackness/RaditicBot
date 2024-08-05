const { Schema, model } = require("mongoose");

let vanitySchema = new Schema({
    guildId: { type: String, required: true },
    vanities: [{
        vanity: { type: String, required: true },
        channelId: { type: String, required: true },
        roleId: { type: String, required: true },
    }]
});

module.exports = model('vanity', vanitySchema);