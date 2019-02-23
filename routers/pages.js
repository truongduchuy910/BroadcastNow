var get = require('../modules/get');
module.exports = function(app){
    app.get('/', (req, res) => res.redirect('/login'));
    //------------------------------------------------------------------------------------------------------------    
    app.get('/dashboard',
    function (req, res, next){
        if (req.isAuthenticated()) {
            return next();            
        } else {
            res.redirect('/login')
        }
    }
    , function(req, res) {
        if (req.user.PSID) {
            get.listCreate(req.user.PSID, function(err, listCreate) {
                get.listFollow(req.user.PSID, function(err, listFollow) {
                    get.listBroadcast(req.user.PSID, function(err, listBroadcast) {
                        res.render('../views/pages/dashboard.ejs', {
                            data : req.user,
                            listCreate: listCreate,
                            listFollow: listFollow,
                            listBroadcast: listBroadcast
                        });
                    })
                })                
            })
        } else {
            res.redirect('/verify');
        }}
   )
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
    })
}