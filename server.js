'use strict';
require('dotenv').config() // Comment-out this line on Glitch
const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const passport = require('passport'); 
const session = require('express-session');

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

app.route('/')
  .get((req, res) => {
    // render view template and send template variable values
    res.render('pug/index', {title: 'Hello', message: 'Please login'});
  });

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});
