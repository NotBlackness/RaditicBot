const mongoose = require('mongoose');

const chatbotSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true }
});

module.exports = mongoose.model('ChatbotChannel', chatbotSchema);