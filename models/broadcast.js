var mongoose = require('mongoose');

var broadcsatSchema = mongoose.Schema({
    PSID: String,
    ID: String,
    label: String,
    content: String,
    date: Date
});
module.exports = mongoose.model('broadcast', broadcsatSchema);