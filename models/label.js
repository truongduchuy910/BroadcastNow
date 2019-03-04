var mongoose = require('mongoose');

var labelSchema = mongoose.Schema({
    name: String,
    ID: String,
    PSID: []
});
module.exports = mongoose.model('label', labelSchema);