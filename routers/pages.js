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
                    res.render('../views/pages/dashboard.ejs', {
                        data : req.user,
                        listCreate: listCreate,
                        listFollow: listFollow,
                        listBroadcast: []
                    });
                })                
            })
        } else {
            res.redirect('/verify');
        }}
   )
    app.post('/dashboard', function(req, res) { 
    })
}