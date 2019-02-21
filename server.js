'use strict';
require('dotenv').config() // Comment-out this line on Glitch
const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const passport = require('passport'); 
const session = require('express-session');
const ObjectID = require('mongodb').ObjectID;
const mongo = require('mongodb').MongoClient;

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

mongo.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, (err, db) => {
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

    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
    });

  }
});


app.route('/')
  .get((req, res) => {
    // render view template and send template variable values
    res.render('pug/index', {title: 'Hello', message: 'Please login'});
  });


