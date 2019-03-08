module.exports = function(app){
    app.get('/', (req, res) => res.redirect('/login'));
    //------------------------------------------------------------------------------------------------------------    
    app.post('/dashboard', function(req, res) { 
    })
    app.get('/setting', 
    function (req, res, next){
        if (req.isAuthenticated()) {
            return next();            
        } else {
            res.redirect('/login')
        }
    }, 
    function(req, res){
        res.render('../views/pages/setting.ejs', {
            data : req.user
        });
    });
    app.get('/test', function (req, res) {
        res.render('../views/pages/test.ejs');
    })
    app.get('/tenaiti', function(req, res) {
        res.render('../views/pages/tenaiti.ejs', {});
    });
    var Public_dut       = require('../models/public.dut');
    app.get('/notification', function(req,res){
        Public_dut.findOne({ID: req.query.ID}, function(err, docs) {
            console.log(docs);
            res.render('../views/pages/notification.ejs', {
                notification: docs
            });
        })
        
    })
    const wit = require('../modules/wit_API');
    app.get('/functions', function(req, res) {
        res.send('OK');
    })
}