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
const socket = io();
```
The comment suppresses the error you would normally see since 'io' is not defined in the file. We've already added a reliable CDN to the Socket.IO library on the page in `chat.pug`.

Now try loading up your app and authenticate and you should see in your server console 'A user has connected'!

NOTE: `io()` works only when connecting to a socket hosted on the same url/server. For connecting to an external socket hosted elsewhere, you would use `io.connect('URL');`.

Submit your page when you think you've got it right. 

---
## 18. Communicate by Emitting  
*Emit* is the most common way of communicating you will use. When you emit something from the server to `io`, you send an event's name and data to all the connected sockets. A good example of this concept would be emitting the current count of connected users each time a new user connects.

Start by adding a variable, just before the connection listener, to keep track of the number of connected users.  
```js
let currentUsers = 0;
```

Next, within the connection listener, you should 1) increment the `currentUsers` when someone connects and 2) emit a `'user count'` event that passes the `currentUsers` data.  
```js
io.on('connection', socket => {
  ++currentUsers;
  console.log('A user has connected');
  io.emit('user count', currentUsers);
});
```

Now, within `client.js`, you can implement a listener on the client, similar to the one on the server, by using the `.on()` method to listen for the `'user count'` event.

```js
socket.on('user count', function(data){
  console.log(data);
});
```
Now, authenticating a user in the app should reflect the number of connected users in the client console, and loading more clients will cause the number to increase accordingly.  

---
## 19. Handle a Disconnect  
At this point, the user count only increases. Handling a user disconnecting is just as easy as handling the initial connect, but *that* event must be handled by a listener on each socket rather than the whole server.  

So, within the connection listener on the server, add a listener that listens for a `'disconnect'` event that passes no data (this functionality can be tested by logging "A user has disconnected." to the console).  Also - to ensure that clients continuously have the updated count of current users, you should decrease the `currentUsers` by 1 when the disconnect happens, then emit the `'user count'` event with the updated count.  
```js
// Handle client disconnects
socket.on('disconnect', () => { 
  /* anything you want to do on disconnect */
  // Decrement connected user count
  --currentUsers;
  console.log("A user has disconnected.");
  // Emit current connected user count
  io.emit('user count', currentUsers);
});
```

### NOTE: 
Just like `'disconnect'`, all other events that a socket can emit to the server should be handled within the `'connection'` listener where `socket` is defined.

---
## 20. Authentication with Socket&#46;io  
Currently, you cannot determine who is connected to your web socket. When users interact directly with the web server, `req.user` contains the user object; however, web sockets have no `req` (request) to make `req.user` available.  

One way to solve this problem is by parsing, decoding, and deserializing the cookie that contains the passport session in order to obtain the user object. This once complex task can now be accomplished with the NPM package `passport.socketio`. Add this package as a dependency (if not already) and require it as `passportSocketIo`:  
```js
const passportSocketIo = require("passport.socketio");
```

Now we just have to tell <span>Socket.io</span> to use it and set the options. Be sure this is added before the existing socket code and *not* in the existing connection listener. For your server it should look as follows:   

```js
io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key: 'express.sid',
  secret: process.env.SESSION_SECRET,
  store: sessionStore
}));
```
You can also optionally pass 'success' and 'fail' with a function that will be called after the authentication process completes when a client tries to connect.  

The user object is now accessible on the socket object as `socket.request.user`; and, can be used, for example, to log who has connected to the server console:  
```js
console.log('user ' + socket.request.user.name + ' connected');
```

---
## 21. Announce New Users  
Many chat rooms are able to annouce when users connect/disconnect and display these events to all connected users in the chat. Because these events are already being emitted here, they just need to be modified to support this feature. The most logical way of doing so is to send three values with the event:  
1. Name of the user  
2. Current user count  
3. Connection status of the user  

Change the name in both `'user count'` `.emit` events to `'user'` and pass a data object containing `name`, `currentUsers`, and `connected` keys with their corresponding values, with `connected` as a boolean `true` when connected and `false` when disconnected.  
```js
io.on('connection', socket => {
  ++currentUsers;
  console.log('A user has connected');
  // Emit user status and connected user count on connect
  io.emit('user', {
    name: socket.request.user.name,
    currentUsers: currentUsers,
    connected: true
  });

  // Handle client disconnects
  socket.on('disconnect', () => { 
    // Decrement connected user count
    --currentUsers;
    console.log("A user has disconnected.");
    // Emit user status and connected user count on disconnect
    io.emit('user', {
      name: socket.request.user.name,
      currentUsers: currentUsers,
      connected: false
    });
  });
});
```
### NOTE:  
As of 2/28/2019, IN ORDER TO PASS the fCC tests for this challenge (because of the regex [in the test assertion](https://github.com/freeCodeCamp/freeCodeCamp/blob/master/curriculum/challenges/english/06-information-security-and-quality-assurance/advanced-node-and-express/announce-new-users.english.md#tests)), the `io.emit` methods above **MUST** be written on **ONE** line, like this:  
```js
io.emit('user', { name: socket.request.user.name, currentUsers: currentUsers, connected: true });
```

Now your client will have all the nesesary information to correctly display the current user count and annouce when a user connects or disconnects! 

Now, on the client side (in `client.js`), create a listener for the `'user'` event that will use jQuery to dynamically update the page rendered from `chat.pug` by:   
1. updating the current user count in the text of `#num-users` and  
2. appending a `<li>` to `<ul id="messages">` indicating that the user has joined/left the chat. 
  
```js
socket.on('user', function(data) {
  $('#num-users').text( data.currentUsers + ' users online' );
  var message = data.name;
  if(data.connected) {
    message += ' has joined the chat.';
  } else {
    message += ' has left the chat.';
  }
  $('#messages').append($('<li>').html('<b>'+ message +'<\/b>'));
});
```

---
## 22. Send and Display Chat Messages  