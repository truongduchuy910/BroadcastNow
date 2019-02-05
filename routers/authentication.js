module.exports = function(app) {
    app.get('/login', function(req, res) {
        res.render('../views/pages/login.ejs', { message: req.flash('loginMessage') }); 
    });
    
   //app.post('/login', passport.authenticate('local-login', {
   //     successRedirect : '/profile',
   //     failureRedirect : '/login', 
   //     failureFlash : true
   // }));
    app.get('/signup', function(req, res) {
        res.render('../views/pages/signup.ejs', { message: req.flash('signupMessage') });
    });
    //app.post('/signup', passport.authenticate('local-signup', {
    //    successRedirect : '/profile', 
    //    failureRedirect : '/signup', 
    //    failureFlash : true 
    //}));
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('../views/pages/profile.ejs', {
            user : req.user 
        });
    });
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}