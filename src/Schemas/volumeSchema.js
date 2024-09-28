const { Schema, model } = require('mongoose');

const VolumeSchema = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  volume: {
    type: Number,
    required: true,
  }
});

module.exports = model('Volume', VolumeSchema);