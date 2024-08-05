const { model, Schema } = require('mongoose');

const noPrefixSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
}, { timestamps: true });

module.exports = model('NoPrefix', noPrefixSchema);