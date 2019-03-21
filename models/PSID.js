var mongoose = require('mongoose');

var PSIDSchema = mongoose.Schema({
    PSID: String,
    first_name: String, 
    last_name: String,
    profile_pic: String,
    wait_to_response: false,
    previous_label: "",
    time: Date

});
module.exports = mongoose.model('PSID', PSIDSchema);