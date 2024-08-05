// afkSchema.js(
const { model, Schema } = require('mongoose');

let afkSchema = new Schema({

    User: String,

    Guild: String,

    Reason: String,

})



module.exports = model('afk', afkSchema);