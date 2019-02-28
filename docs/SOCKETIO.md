# Challenges: Socket&#46;io  (17 - 22)  

[README](../README.md)  | [ADVANCED NODE](./ADVANCEDNODE.md)  | [SOCIAL AUTHENTICATION](./SOCIALAUTH.md)  

## IMPORTANT:
The challenges in this section are built upon a NEW starter project which may be cloned from [this Github repo](https://github.com/freeCodeCamp/boilerplate-socketio/) and/or [imported into Glitch](https://glitch.com/#!/import/github/freeCodeCamp/boilerplate-socketio/). 

That said, be sure and *keep* the `SESSION_SECRET` and `MONGODB_URI` environment variables from the previous challenges (they can be re-used here) and, update the `mongo.connect()` method with the `{ useNewUrlParser: true }` option, correct env variable, and correction of the `db` variable (this method now returns the client, NOT the db!):  
```js
mongo.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, (err, client) => {
  let db = client.db();
  // ...
});
```
---
## 17. Setup the Environment  
Add `'socket.io'` as a dependency and require/instantiate it in your server defined as `io` with the `http` server as an argument.  
```js
const io = require('socket.io')(http);
```
Next, setup a listener for connection from the client. 
The first thing to be handled is listening for a new connection from the client. The `on` keyword does just that by listening for a specific event. It requires two arguments: 1) a string containing the title of the event that's emitted, and 2) a function through which the data is passed. In the case of our connection listener, we use socket to define the data in the second argument. A socket is an individual client who is connected.

For listening for connections on our server, add the following between the comments in your project:
```js
io.on('connection', socket => {
  console.log('A user has connected');
});
```
Now, for the client to connect, you just need to add the following to your `client.js` which is loaded by the page after you've authenticated:  
```js
/*global io*/
var socket = io();
```
The comment suppresses the error you would normally see since 'io' is not defined in the file. We've already added a reliable CDN to the Socket.IO library on the page in `chat.pug`.

Now try loading up your app and authenticate and you should see in your server console 'A user has connected'!

NOTE: `io()` works only when connecting to a socket hosted on the same url/server. For connecting to an external socket hosted elsewhere, you would use `io.connect('URL');`.

Submit your page when you think you've got it right. 

---
## 18. Communicate by Emitting  


---
## 19. Handle a Disconnect  


---
## 20. Authentication with Socket&#46;io  
https://www.freecodecamp.org/forum/t/youre-gonna-need-this-if-you-want-to-pass-authentication-with-socket-io-challenge/209460


---
## 21. Announce New Users  

---
## 22. Send and Display Chat Messages  