# fCC Challenges: Advanced Node and Express  
https://learn.freecodecamp.org/information-security-and-quality-assurance/advanced-node-and-express  

Built upon [Joseph Livengood](https://github.com/JosephLivengood)'s [boilerplate code](https://github.com/freeCodeCamp/boilerplate-advancednode/blob/gomix/package.json).  

## CHALLENGES  

### 1. Setup a Template Engine  

Install Pug  
```bash
npm install pug
```
Set the templating engine in `server.js`  
```js
// Set view engine to use pug
app.set('view engine', 'pug');
```
Change the response in the index route to `res.render()` using the path to the `index.pug` file.  
```js
app.route('/').get((req, res) => {
  // render view template
  res.render('pug/index');
});
```

### 2. Use a Template Engine's Powers  
Variables can be passed from the server to the template file before rendering into HTML; and, in the pug file, they may be referenced either inline with other text as `#{variable_name}` or by appending them directly to an element `p= variable_name` (notice no space between `p` and `=`).  

To render the variables within the template, send them within an object as the second argument in `res.render()`. Here, send the variables `title` and `message` to `index.pug`.  
```js
app.route('/').get((req, res) => {
  // render view template and send template variable values
  res.render('pug/index', {title: 'Hello', message: 'Please login'});
});
```

### 3. Setup Passport  
#### Install dependencies:  
[Passport](https://github.com/jaredhanson/passport) is express-compatable middleware for authenticating requests in Node.js, and [express-session](https://www.npmjs.com/package/express-session) handles sessions by saving the sessionId on the client while storing the actual session *data* on the server. This way, the cookie on the client only stores a key to access the data on the server for authentication purposes. Also, for local development, [dotenv](https://www.npmjs.com/package/dotenv) will be used to access environment variables in an `.env` file (this package is is not needed on Glitch). Install these packages and create the `.env` file:  
```bash
npm install passport express-session && npm install dotenv --save-dev && touch ./.env
```
#### Setup session settings and initialize Passport
Create a `SESSION_SECRET` variable in the `.env` file and assign it a random value.  
```bash
echo SESSION_SECRET=$(openssl rand -hex 6) > ./.env
``` 
At the top of `server.js`, require and config `dotenv` before other `require` variables. Then, require `passport` and `express-session`.  
```js
'use strict';
require('dotenv').config() // Comment-out this line on Glitch
const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const passport = require('passport'); 
const session = require('express-session');
```

Setup app to use session with just a few basic options. The SESSION_SECRET created earlier is used to create the hash that will encrypt the cookie.  
```js
// Setup app to use session with just a few basic options
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));
```
Setup middleware to initialize passport and use with session.  
```js
// Setup app to use Passport with session
app.use(passport.initialize());
app.use(passport.session());
```

### 4. Serialization of a User Object  
Serialization and deserialization are important concepts in regards to authentication. To serialize an object means to convert its contents into a small key essentially that can then be deserialized into the original object. This is what allows us to know whos communicated with the server without having to send the authentication data like username and password at each request for a new page.

To set this up properly, we need to have a serialize function and a deserialize function. In passport we create these with `passport.serializeUser( OURFUNCTION )` and `passport.deserializeUser( OURFUNCTION )`.

The `serializeUser` is called with 2 arguments: the full user object and a callback used by passport. Returned in the callback should be a unique key to identify that user - the easiest one being the unique _id generated by MongoDB.  

Similarly, `deserializeUser` is called with that key and a callback function that will use the key to return the user's full object.  

To make a query search for a Mongo `_id` you will have to create `const ObjectID = require('mongodb').ObjectID;`, and use it by calling `new ObjectID(THE_ID)`. Be sure to add MongoDB as a dependency. You can see this in the examples below.  

NOTE: `deserializeUser` will throw an error until a DB is setup (in the next step), so comment out the `db.collection().findOne()` method for now and call `done(null, null)`.  

Require the mongo ObjectID and add the serialization & deserialization functions.  
```js
const ObjectID = require('mongodb').ObjectID; 

// ...

// Setup user object serialization & deserialization
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  // db.collection('users').findOne(
  //   {_id: new ObjectID(id)},
  //   (err, doc) => {
  //     done(null, doc);
  //   }
  // );
  done(null, null);
});
```

### 5. Implement the Serialization of a Passport User  
Create a new, empty Mongo database and db user on [mLab](https://mlab.com/welcome/), obtain the connection URI, and store it in a `MONGODB_URI` variable in `.env`.  

In order to connect to the database once when the server starts and persist for the full life-cycle of the app, require the MongoClient.  
```js
const mongo = require('mongodb').MongoClient;
```
Now, create a connection method after the session and passport initialization  middleware with basic error handling. In order to only allow requests upon successful, error-free database connection, move the serialization functions, base URL route, and app listener into the connection method.  
```js
mongo.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, (err, client) => {
  let db = client.db(); // .db('DB_NAME') defaults to the db in connection string if no DB_NAME is given here.

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

    app.route('/').get((req, res) => {
      // render view template and send template variable values
      res.render('pug/index', {title: 'Hello', message: 'Please login'});
    });

    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
    });

  }
});
```

### 6. Authentication Strategies  
A *strategy* is a way of authenticating a user. You can use a strategy for allowing users to authenticate based on locally saved information (if you have them register first) or from a [variety of providers](http://www.passportjs.org/packages/) such as Google or Github.  

This project will use the [passport-local](http://www.passportjs.org/packages/passport-local/) strategy, so install it as a project dependency, then require it in `server.js`.  
```bash
npm install passport-local
```
```js
const LocalStrategy = require('passport-local');
```
Next, direct passport to use an instantiated `LocalStrategy` object with a few settings defined. Make sure this (and everything else reliant upon the database) is encapsulated within the database connection.  
```js
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
```
This strategy defines the local authentication process. It first checks for a matching user in the database against the submitted username, then checks for a matching password. If no errors are encountered, the user object is returned and authentication succeeds. 

Each Passport strategy will have its own unique settings to configure, and some (e.g. [passport-github](http://www.passportjs.org/packages/passport-github/)) use OAuth instead of username/password for authentication. In each case, the proper usage is documented within its respective repository.  

The next challenge will setup the authentication strategy to be called in response to submitted form data in order to validate the user. 

### 7. How to Use Passport Strategies  
In the `index.pug` file, there is a login form within the `if showLogin` conditional that is currently not being rendered because the `showLogin` variable has yet to be defined.  

Within the res.render of the base URL route, add `showLogin: true` to the local variables object in order to render the login form upon page refresh.  
```js
app.route('/').get((req, res) => {
  // render view template and send template variable values
  res.render('pug/index', {title: 'Hello', message: 'Please login', showLogin: true});
});
```

As the login form is setup to POST on `/login`, a new POST route is needed to receive that request. In order to authenticate on this route with the `passport-local` strategy (with the optional redirection of any authentication failures back to the base URL), add the middleware `passport.authenticate('local', { failureRedirect: '/' })` as an argument before the callback. The response (which will only be sent if authentication is successful) should redirect to `/profile`, which will need another route handler that renders the `profile.pug` template in its response.  

```js
app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/profile');
});

app.route('/profile').get((req, res) => {
  // render view template 
  res.render('pug/profile');
});
```

### 8. Create New Middleware  

NOTE: As of 2/21/2019, the [second test run against this challenge on the fCC platform](https://github.com/freeCodeCamp/freeCodeCamp/blob/master/curriculum/challenges/english/06-information-security-and-quality-assurance/advanced-node-and-express/create-new-middleware.english.md#tests) looks for the presence of the text 'Home page' on the home page generated from the `index.pug` template. If it's not there it will fail, even if this challenge is coded correctly! The workaround I used: change the description `meta` tag in the `head` of the template to this:  

```pug
meta(name='description', content='Home page')
```

Currently, `/profile` is accessible by merely typing in the URL. Since this route is intended only for authenticated users, middleware is needed here to verify authentication before rendering the profile page. 

Create a function `ensureAuthenticated(req, res, next)` to use as middleware that will call passport's `.isAuthenticated()` for verification of the request. If true, it continues; otherwise, redirect to the home page.  

```js
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};
```
Now, add `ensureAuthenticated` as middleware to the `/profile` route handler, before the callback.  

```js
app.route('/profile').get(ensureAuthenticated, (req, res) => {
  // render view template 
  res.render(process.cwd() + '/views/pug/profile');
});
```

### 9. How to Put a Profile Together   
Now that only authenticated users can access `/profile`, the information contained in `req.user` can be used on the page.

In the `/profile` route render method, pass an object with a local variable `username` set to `req.user.username` to be made available to the template.  
```js
app.route('/profile').get(ensureAuthenticated, (req, res) => {
  res.render(process.cwd() + '/views/pug/profile', {username: req.user.username});
});
```
In the `profile.pug` template, add an `h2` element with class `center` and id `welcome`, containing the text "Welcome, [supply username]! Also, add a link to `/logout`, which will be the route that will contain the code to unauthenticate the user.  

```pug
h2.center#welcome Welcome, #{username}!
a(href='/logout') Logout
```

### 10. Logging a User Out  

### 11. Registration of New Users  

### 12. Hashing Your Passwords  

### 13. Cleanup Your Project with Modules  

### 14. Implementation of Social Authentication (I)  

### 15. Implementation of Social Authentication (II)  

### 16. Implementation of Social Authentication (III)  

### 17. Setup the Environment  

### 18. Communicate by Emitting  

### 19. Handle a Disconnect  

### 20. Authentication with Socket&#46;io  
https://www.freecodecamp.org/forum/t/youre-gonna-need-this-if-you-want-to-pass-authentication-with-socket-io-challenge/209460

### 21. Announce New Users  

### 22. Send and Display Chat Messages  