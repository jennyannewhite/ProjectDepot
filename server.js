//dependencies
var express = require("express");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var exphbs = require("express-handlebars");
var passport = require('passport');
var util = require('util');
var session = require('express-session');
var GitHubStrategy = require('passport-github2').Strategy;
var partials = require('express-partials');
var PORT = process.env.PORT || 8080;
var db = require("./models");

//for github passport
// var GITHUB_CLIENT_ID = "c0bd269a1176ef95c5b4";
// var GITHUB_CLIENT_SECRET = "5fbb09797aa6cb40d91716010281133fc7e2b38c";

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete GitHub profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the GitHubStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and GitHub
//   profile), and invoke a callback with a user object.
// passport.use(new GitHubStrategy({
//     clientID: GITHUB_CLIENT_ID,
//     clientSecret: GITHUB_CLIENT_SECRET,
//     callbackURL: "https://project-depot.herokuapp.com/auth/github/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {

//     process.nextTick(function () {
      
//       return done(null, profile);
//     });
//   }
// ));



//configuring express app
var app = express();
app.use(partials());
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(methodOverride("_method"));

// Serve static content for the app from the "public" directory in the application directory.
// app.use(express.static(process.cwd() + "/public"));

//using bodyparser for post and put data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
// app.use(express.static(__dirname + '/public'));

// Links the static content (i.e. css and images)
app.use(express.static(__dirname + '/public'));
// 

// SETUP HANDLEBARS ENGINE
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


//IMPORT ROUTES
var sandboxRoutes = require("./controllers/sandbox_controller.js")(app);

var loginRoutes = require("./controllers/login_controller.js")(app);

var pageRoutes = require("./controllers/pages_controller.js")(app);

//syncing database and listening 
db.sequelize.sync().then(function() {
    app.listen(PORT, function () {
console.log("App listening this PORT: " + PORT);
    });
});