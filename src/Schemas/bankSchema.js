const { model, Schema } = require('mongoose');

const bankSchema = new Schema({
    userId: {
      type: String,
      unique: true,
      required: true,
    },
    userName: {
      type: String,
    },
    balance: {
      type: Number,
      default: 0,
    },
});

module.exports = model('Bank', bankSchema);