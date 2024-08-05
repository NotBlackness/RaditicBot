const { model, Schema } = require('mongoose');

const AutoResponderSchema = new Schema({
  guildId: String,
  autoresponses: [
    {
      trigger: String,
      response: String
    }
  ]
});
module.exports = model('AutoResponder', AutoResponderSchema);