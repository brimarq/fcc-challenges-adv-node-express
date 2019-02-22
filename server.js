'use strict';
require('dotenv').config() // Comment-out this line on Glitch
const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const passport = require('passport'); 
const session = require('express-session');
const ObjectID = require('mongodb').ObjectID;
const mongo = require('mongodb').MongoClient;
const LocalStrategy = require('passport-local');

const app = express();

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set view engine to use pug
app.set('view engine', 'pug');

// Setup app to use session with just a few basic options
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));

// Setup app to use Passport with session
app.use(passport.initialize());
app.use(passport.session());

mongo.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, (err, client) => {
  let db = client.db();
  if(err) {
    console.log('Database error: ' + err);
  } else {
    console.log('Successful database connection');
    //serialization and app.listen 

    // Setup user object serialization & deserialization
    passport.serializeUser((user, done) => {
      done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
      db.collection('users').findOne(
        {_id: new ObjectID(id)},
        (err, doc) => {
          done(null, doc);
        }
      );
    });

    passport.use(new LocalStrategy(
      function(username, password, done) {
        db.collection('users').findOne({ username: username }, function (err, user) {
          console.log('User '+ username +' attempted to log in.');
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          if (password !== user.password) { return done(null, false); }
          return done(null, user);
        });
      }
    ));

    function ensureAuthenticated(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect('/');
    };

    app.route('/').get((req, res) => {
      // render view template and send template variable values
      res.render(process.cwd() + '/views/pug/index', {title: 'Hello', message: 'Please login', showLogin: true});
    });

    app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
      res.redirect('/profile');
    });

    app.route('/profile').get(ensureAuthenticated, (req, res) => {
      // render view template 
      res.render(process.cwd() + '/views/pug/profile', {username: req.user.username});
    });

    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
    });


    

  }
});





