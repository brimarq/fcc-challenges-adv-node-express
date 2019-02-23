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
const bcrypt = require('bcrypt');

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
          if (!bcrypt.compareSync(password, user.password)) { return done(null, false); }
          return done(null, user);
        });
      }
    ));

    /** CORRECTS fCC TESTS FAILING for "Registration of New Users" challenge (as of 2/22/2019)
     * Tests not run asynchronously? Set ENABLE_DELAYS=true in .env to enable. 
     * See issue: https://github.com/freeCodeCamp/freeCodeCamp/issues/17820#issue-338363681
     */
    if (process.env.ENABLE_DELAYS) app.use((req, res, next) => {
      switch (req.method) {
        case 'GET':
          switch (req.url) {
            case '/logout': return setTimeout(() => next(), 500);
            case '/profile': return setTimeout(() => next(), 700);
            default: next();
          }
        break;
        case 'POST':
          switch (req.url) {
            case '/login': return setTimeout(() => next(), 900);
            default: next();
          }
        break;
        default: next();
      }
    });

    function ensureAuthenticated(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect('/');
    };

    app.route('/').get((req, res) => {
      // render view template and send template variable values
      res.render(process.cwd() + '/views/pug/index', {title: 'Hello', message: 'Please login', showLogin: true, showRegistration: true});
    });

    app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
      res.redirect('/profile');
    });

    app.route('/profile').get(ensureAuthenticated, (req, res) => {
      // render view template 
      res.render(process.cwd() + '/views/pug/profile', {username: req.user.username});
    });

    app.route('/logout').get((req, res) => {
      req.logout();
      res.redirect('/');
    });

    app.route('/register').post(
      /** 1) Query the db w/err handling as middleware. If user exists, redirect to homepage;  
       * otherwise, insert user into db. If error here, redirect to homepage; otherwise, 
       * pass user to the next middleware for authentication.
       */
      (req, res, next) => {
        db.collection('users').findOne({ username: req.body.username }, function (err, user) {
          if(err) {
            next(err);
          } else if (user) {
            res.redirect('/');
          } else {
            let hash = bcrypt.hashSync(req.body.password, 12);
            db.collection('users').insertOne(
              {username: req.body.username, password: hash},
              (err, doc) => {
                if(err) {
                  res.redirect('/');
                } else {
                  next(null, user);
                }
              }
            );
          }
        });
      },

      /** 2) Authenticate user as middleware. Failure redirects to home page */
      passport.authenticate('local', { failureRedirect: '/' }),

      /** 3) Callback that redirects authenticated user to profile page */
      (req, res, next) => {
        res.redirect('/profile');
      }

    );

    app.use((req, res, next) => {console.log(req); next();});

    // 404 middleware to catch requests for undefined routes
    app.use((req, res, next) => {
      res.status(404).type('text').send('Not Found');
    });

    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
    });


    

  }
});





