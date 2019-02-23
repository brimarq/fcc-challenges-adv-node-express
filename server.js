'use strict';
require('dotenv').config() // Comment-out this line on Glitch
const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const mongo = require('mongodb').MongoClient;
const routes = require('./routes.js');
const auth = require('./auth.js');
const challenge11patch = require('./freeCodeCamp/challenge11patch.js');

const app = express();

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set view engine to use pug
app.set('view engine', 'pug');


mongo.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, (err, client) => {
  let db = client.db();
  if(err) {
    console.log('Database error: ' + err);
  } else {
    console.log('Successful database connection');

    auth(app, db);

    /** CORRECTS fCC TESTS FAILING for "Registration of New Users" challenge (as of 2/22/2019)
     * Tests not run asynchronously? Set ENABLE_DELAYS=true in .env to enable. 
     * See issue: https://github.com/freeCodeCamp/freeCodeCamp/issues/17820#issue-338363681
     */
    challenge11patch(app);

    routes(app, db);

    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
    });

  }
});
