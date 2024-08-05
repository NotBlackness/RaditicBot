const { model, Schema } = require('mongoose');

const leaveSchema = new Schema({
    guildId: String,
    leaveMessage: String,
    channelId: String,
    embedColor: String,
    embedTitle: String,
    embedOption: String,
    thumbnailUrl: String,
    bannerUrl: String,
    footerText: String
});

module.exports = model('leaveSystem', leaveSchema);