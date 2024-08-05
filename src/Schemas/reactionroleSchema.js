const { model, Schema } = require('mongoose');

let reaction = new Schema({
  guildId: String,
  messageId: String,
  Emoji: String,
  Role: String
});

module.exports = model('ReactionRoleSchema', reaction)