var mongoose = require('mongoose');

var public_dutSchema = mongoose.Schema({
    ID: String, 
    date: String,
    dateObj: Date,
    title: String,
    contentHTML: String
});
module.exports = mongoose.model('public.dut', public_dutSchema);