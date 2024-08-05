const mongoose = require('mongoose');

const timerSchema = new mongoose.Schema({
  messageId: {
    type: String, 
    required: true 
  },
  channelId: {
    type: String, 
    required: true 
  },
  endTime: {
    type: Date, 
    required: true 
  }
});

module.exports = mongoose.model('Timer', timerSchema);