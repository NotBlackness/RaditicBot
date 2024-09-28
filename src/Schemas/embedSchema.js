const mongoose = require('mongoose');

const embedSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  channelId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '#fffff', // Default to white if no color is provided
  },
  footer: {
    text: {
      type: String,
      default: '', // Optional
    },
    icon_url: {
      type: String,
      default: '', // Optional
    },
  },
  author: {
    name: {
      type: String,
      default: '', // Optional
    },
    icon_url: {
      type: String,
      default: '', // Optional
    },
  },
}, {
  timestamps: true, // Automatically create createdAt and updatedAt timestamps
});

module.exports = mongoose.model('Embed', embedSchema);