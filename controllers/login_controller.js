// REQUIRE FUNCTIONS FROM THE MODELS FOLDER (index.js, post.js, user.js, userpost.js)
var db = require("../models");
var passport = require('passport');

// EXPORT ROUTES
module.exports = function (app) {

  app.get('/account', ensureAuthenticated, function (req, res) {
    res.render('account', {
      user: req.user,
      email: req.user.emails[0].value
    });
  });

  // USE PASSPORT.AUTHENTICATE() AS ROUTE MIDDLEWARE TO AUTHENTICATE REQUEST
  // STEP ONE: REDIRECT USER TO GITHUB.COM  After authorization, GitHub will redirect the user
  // STEP TWO:  GITHUB REDIRECTS USER BACK TO APP AT /auth/github/callback
  app.get('/auth/github',
    passport.authenticate('github', {
      scope: ['user:email']
    }),
    function (req, res) {
      // REQUEST IS REDIRECTED TO GITHUB FOR AUTHENTICATION SO THIS FUNCTION IS NOT CALLED
    });


  // USE PASSPORT.AUTHENTICATE() AS ROUTE MIDDLEWARE TO AUTHENTICATE REQUEST
  // PRIMARY ROUTE RUNCTION IS CALLED AND USER REDIRECTS TO HOME PAGE
  // (REDIRECTS TO LOGIN PAGE IF FAIL)
  app.get('/auth/github/callback',
    passport.authenticate('github', {
      failureRedirect: '/login'
    }),
    function (req, res) {
      //CHANGE TO TRUE WHEN LOGGED IN
      module.exports.loggedIn = true;

      var username = req.user._json.login;
      var pictureUrl = req.user._json.avatar_url;
      var email = req.user._json.email;

      //LOGS USER INTO DATABASE UPON SIGN IN
      db.User.findOrCreate({
          where: {
            user_name: username
          },
          defaults: {
            picture_url: pictureUrl,
            email: email
          }
        })
        .spread(function (user, created) {
          console.log(user.get({
            plain: true
          }));
          console.log(created);
          res.redirect('/');
        });
    });

  //CHANGE TO FALSE WHEN LOGGED OUT
  app.get('/logout', function (req, res) {
    module.exports.loggedIn = false;
    req.logout();
    res.redirect('/');
  });

  //PASSPORT FUNCTION FOR AUTH LOGIN (REDIRECTS TO HOME IF FAIL)
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  }

};