const mongoose = require('mongoose');

const autoroleSchema = new mongoose.Schema({
  guildId: String,
  roles: [String] // Store role IDs
});

module.exports = mongoose.model('Autorole', autoroleSchema);