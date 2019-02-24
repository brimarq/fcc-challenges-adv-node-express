# Challenges: Social Authentication (14 - 16)   

[README](../README.md)  | [ADVANCED NODE](./ADVANCEDNODE.md)  | [SOCKET.IO](./SOCKETIO.md)  
 
## IMPORTANT:
The challenges in this section are built upon a NEW starter project which may be cloned from [this Github repo](https://github.com/freeCodeCamp/boilerplate-socialauth/) and/or [imported into Glitch](https://glitch.com/#!/import/github/freeCodeCamp/boilerplate-socialauth/). 

That said, be sure and *keep* the `SESSION_SECRET` and `MONGODB_URI` environment variables from the previous challenges (they can be re-used here) and, update the `mongo.connect()` method with the `{ useNewUrlParser: true }` option and correct env variable:  
```js
mongo.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, (err, db) => {
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


---
## 16. Implementation of Social Authentication (III)  

