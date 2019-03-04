const ms_moles = require('../models/messenger');
var public_dut = require('./public_dut')
module.exports = function(app) {
    app.get('/public_dut',  (req,res) => {
        var action = req.query.action;
        switch (action) {
            case 'check' :
                console.log('API public_dut > check');
                public_dut.new_notifications(function(err, docs) {
                    var have_new = false;
                    docs.forEach(element => {
                        if (element) have_new = true;
                    });

                    res.send({have_new: have_new});
                });
            break;
            case 'check_new':
                console.log('API public_dut > check_new');
                public_dut.new_notifications(function(err, docs) {
                    res.send(docs);
                }); 
            break;
            default:
                res.send();
            break;
        }            
    })
    app.get('/getData', (req,res) => {
        res.send('OK');
    })
}