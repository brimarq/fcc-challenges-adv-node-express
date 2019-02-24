# Challenges: Social Authentication (14 - 16)   

[README](../README.md)  | [ADVANCED NODE](./ADVANCEDNODE.md)  | [SOCKET.IO](./SOCKETIO.md)  
 
## IMPORTANT:
The challenges in this section are built upon a NEW starter project which may be cloned from [this Github repo](https://github.com/freeCodeCamp/boilerplate-socialauth/) and/or [imported into Glitch](https://glitch.com/#!/import/github/freeCodeCamp/boilerplate-socialauth/). 

That said, be sure and *keep* the `SESSION_SECRET` and `MONGODB_URI` environment variables from the previous challenges (they can be re-used here) and, update the `mongo.connect()` method with the `{ useNewUrlParser: true }` option, correct env variable, and correction of the `db` variable (this method now returns the client, NOT the db!):  
```js
mongo.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, (err, client) => {
  let db = client.db();
  // ...
});
```
ALSO: if in a local development environment, make sure that `dotenv` is installed as a dev dependency and `require()`d where appropriate.  

---
## 14. Implementation of Social Authentication (I)  
The basic path this kind of authentication will follow in your app is:  
1. User clicks a button or link sending them to our route to authenticate using a specific strategy (EG. Github).  
2. Your route calls `passport.authenticate('github')` which redirects them to Github.  
3. The page the user lands on, on Github, allows them to login if they aren't already. It then asks them to approve access to their profile from our app.  
4. The user is then returned to our app at a specific callback url with their profile if they are approved.  
5. They are now authenticated and your app should check if it is a returning profile, or save it in your database if it is not.  

Strategies using OAuth require at least a Client ID and a Client Secret in order to verify the origin and validity of the authentication request. These are obtained from the site whose authentication you wish to implement (e.g. Github), and are *unique to your app*. As such, THEY ARE NOT TO BE SHARED and should never be uploaded to a public repository or written directly in your code. A common practice is to put them in your `.env` file and reference them like: `process.env.GITHUB_CLIENT_ID`. For this challenge, we're going to use the Github strategy.

Obtaining Client ID and Client Secret tokens from Github is done in your account profile settings under ['Developer settings'](https://github.com/settings/developers), then 'OAuth Apps'. Click 'Register a new application', name your app, paste in the url to your glitch homepage (Not the project code's url), and - for the authorization callback URL - paste in the homepage URL appended with `/auth/github/callback` . The authorization callback URL is where users will be redirected after authenticating on Github, which can be caught with a route handler in the app. Once the app is registered, assign the returned Client ID and Client Secret tokens to their respective variables `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in the `.env` file.

On your remixed project, create 2 routes accepting GET requests: `'/auth/github'` and `'/auth/github/callback'`. The first should only call passport to authenticate `'github'` and the second should call passport to authenticate `'github'` with a failure redirect to `'/'` and then if that is successful redirect to `'/profile'` (similar to our last project).  
 
```js
app.route('/auth/github').get(passport.authenticate('github'));

app.route('/auth/github/callback').get(passport.authenticate('github', { failureRedirect: '/' }), (req, res) => { 
  res.redirect('/profile');
});
```

---
## 15. Implementation of Social Authentication (II)  
The last part of setting up your Github authentication is to create the strategy itself. For this, you will need to add the [passport-github](http://www.passportjs.org/packages/passport-github/) dependency to your project and require it as `GithubStrategy` in `server.js`.  

```console
npm install passport-github
```
```js
const GitHubStrategy = require('passport-github').Strategy;
```

To [set up the Github strategy](http://www.passportjs.org/packages/passport-github/#configure-strategy), passport must be directed to use a newly instantiated GithubStrategy, which accepts two arguments: 
1. An object containing `clientID`, `clientSecret`, and `callbackURL`, and   
2. a function to be called when a user is successfully authenticated  
   
NOTE: The authorization callback URL set when registering the app at Github can be saved in a `GITHUB_AUTH_CB_URL` variable in `.env`, which can then be referenced in the strategy. This works beautifully; but, unsurprisingly, *doing so will FAIL freeCodeCamp's tests for this challenge*, which apparently look for the actual URL string to be hardcoded there. So, in order to pass the automated tests, use the URL string. Meh.

At this point, any authentication attempted from the "Login with Github!" link on the app homepage will fail with a "TokenError", as `cb` is never called to complete the authentication. That said, it should still receive the Github profile data and log it to the console. 

```js
passport.use( new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_AUTH_CB_URL  /*INSERT CALLBACK URL ENTERED INTO GITHUB HERE*/
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    //Database logic here with callback containing our user object
  }
));
```

---
## 16. Implementation of Social Authentication (III)  
The final part of the strategy is handling the profile returned from Github. 

We need to query the database for the user, retrieving and returning the document if found; otherwise, creating and returning a new document populated with values from the profile. 

Github provides a unique `id` within each profile that can be serialized (already implemented) and used as a search parameter. Here is an implementation that can be used within the verify function of the `GitHubStrategy`: 

```js
db.collection('socialusers').findAndModify(
  {id: profile.id},
  {},
  { $setOnInsert: {
      id: profile.id,
      name: profile.displayName || 'John Doe',
      photo: profile.photos[0].value || '',
      email: profile.emails ? profile.emails[0].value : 'No public email',
      created_on: new Date(),
      provider: profile.provider || ''
    },
    $set: { last_login: new Date() }    $inc: { login_count: 1 }
  },
  {upsert: true, new: true},
  (err, doc) => {
    return cb(null, doc.value);
  }
);
```

The [findAndModify](http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#findAndModify) method above (now depreciated), is used to find and/or "upsert" (update if exists, insert if not) a database document and return the new object each time in the callback function. In this example, we always set the `last_login` to now, increment the `login_count` by 1, and only when we insert a new object(new user) do we populate the majority of the fields. Something to notice also is the use of default values.  

You should be able to login to your app nowand complete authentication. If you're running into errors, you can check out an example of this mini-project's finished code [here](https://glitch.com/#!/project/guttural 