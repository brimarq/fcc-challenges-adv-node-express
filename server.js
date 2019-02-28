'use strict';
require('dotenv').config();
const express     = require('express');
const session     = require('express-session');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const auth        = require('./app/auth.js');
const routes      = require('./app/routes.js');
const mongo       = require('mongodb').MongoClient;
const passport    = require('passport');
const cookieParser= require('cookie-parser')
const app         = express();
const http        = require('http').Server(app);
const sessionStore = new session.MemoryStore();
const io = require('socket.io')(http);


fccTesting(app); //For FCC testing purposes

app.use('/public', express.static(process.cwd() + '/public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug')

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  key: 'express.sid',
  store: sessionStore,
}));


mongo.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, (err, client) => {
  let db = client.db();
  if(err) console.log('Database error: ' + err);

  auth(app, db);
  routes(app, db);
    
  http.listen(process.env.PORT || 3000);


  //start socket.io code  
  let currentUsers = 0;

  io.on('connection', socket => {
    ++currentUsers;
    console.log('A user has connected');
    io.emit('user count', currentUsers);

    // Handle client disconnects
    socket.on('disconnect', () => { 
      // Decrement connected user count
      --currentUsers;
      console.log("A user has disconnected.");
      // Emit current connected user count
      io.emit('user count', currentUsers);
    });
  });


  //end socket.io code
  
  
});