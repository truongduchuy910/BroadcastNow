var mongoose = require('mongoose');

var public_dutSchema = mongoose.Schema({
    date: String,
    dateObj: Date,
    title: String,
    content: String,
    link: Array,
    body: String
});
module.exports = mongoose.model('public.dut', public_dutSchema);