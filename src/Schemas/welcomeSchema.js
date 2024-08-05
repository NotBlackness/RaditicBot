const { model, Schema } = require('mongoose');

const welcomeSchema = new Schema({
  guildId: String,
  welcomeMessage: String,
  channelId: String,
  embedColor: String,
  embedTitle: String,
  embedOption: String,
  thumbnailUrl: String,
  bannerUrl: String,
  footerText: String
});

module.exports = model('welcomeSystem', welcomeSchema);