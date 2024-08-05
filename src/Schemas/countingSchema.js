const { model, Schema } = require('mongoose');

const counting = new Schema({
  Guild: String,
  Channel: String,
  Number: Number,
  LastUser: String
});

module.exports = model('counting', counting);