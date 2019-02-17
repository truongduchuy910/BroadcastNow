//routers/authentication.js
module.exports = function(app, passport) {
    //------------------------------------------------------------------------------------------------------------
    app.get('/signup', function(req, res) {
        res.render('../views/pages/signup.ejs', { message: req.flash('signupMessage') });
    });
    app.post('/signup', 
    function(req, res, next) {
        next();
    },
    passport.authenticate('local-signup', {
        successRedirect : '/', 
        failureRedirect : '/signup', 
        failureFlash : true 
    }));
    //------------------------------------------------------------------------------------------------------------
    app.get('/login', 
    function (req, res, next) {
        if (req.isAuthenticated()) {
            res.redirect('/dashboard')
        } else {
            return next();
        }
    },   
    function(req, res) {
        res.render('../views/pages/login.ejs', { message: req.flash('loginMessage') });}
    );
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/dashboard',
        failureRedirect : '/login', 
        failureFlash : true
    })
    );
    //------------------------------------------------------------------------------------------------------------
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    //------------------------------------------------------------------------------------------------------------    
    app.get('/verify',
    function (req, res, next){
        if (req.isAuthenticated()) {
            return next();            
        } else {
            res.redirect('/login')
        }
    },
    function (req, res) {
        if (req.user.verifyCode == "done") {
            res.render('../views/pages/login.ejs')
        } else {
            res.render('../views/pages/verify.ejs', {
                user: req.user
            })
        }
    }
    );
    
}
