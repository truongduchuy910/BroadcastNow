var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
    type: String,
    message: {}
});
module.exports = mongoose.model('message', messageSchema);