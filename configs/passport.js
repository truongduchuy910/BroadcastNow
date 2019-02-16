// config/passport.js
var LocalStrategy   = require('passport-local').Strategy;
var User            = require('../models/users');
var db              = require('../modules/database');
var request = require('request')

module.exports = function(passport) {
    passport.use('verify', function(req) {

    })
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

   passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) {
        User.findOne({ 'local.email' :  email }, function(err, docs) {
            if (err)
                return done(err);
            if (!docs)
                return done(null, false, req.flash('loginMessage', 'Không tìm thấy tài khoản')); 
            if (!docs.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Ồ! Sai mật khẩu rồi.')); 
            return done(null, docs);            
        });
    }));
    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) {
        process.nextTick(function() {
        User.findOne({ 'local.email' :  email }, function(err, user) {
            if (err)
                return done(err);
            if (user) {
                return done(null, false, req.flash('signupMessage', 'Email  đã tồn tại .'));
            } else {
                var newUser            = new User();
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);
                newUser.verifyCode = radom();
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });    

        });

    }));
};
function radom() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 20; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }
  