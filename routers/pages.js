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


    var request     = require('request')
    app.get('/functions', function(req, res) {
        res.send('OK');
    })
}