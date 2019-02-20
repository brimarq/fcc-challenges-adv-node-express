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

### 5. Implement the Serialization of a Passport User  

### 6. Authentication Strategies  

### 7. How to Use Passport Strategies  

### 8. Create New Middleware  

### 9. How to Put a Profile Together  

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

### 21. Announce New Users  

### 22. Send and Display Chat Messages  