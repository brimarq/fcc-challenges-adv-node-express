const passport = require('passport');
const bcrypt = require('bcrypt');

module.exports = function (app, db) {

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };

  app.route('/').get((req, res) => {
    // render view template and send template variable values
    res.render(process.cwd() + '/views/pug/index', {title: 'Hello', message: 'Please login', showLogin: true, showRegistration: true});
  });

  app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/profile');
  });

  app.route('/profile').get(ensureAuthenticated, (req, res) => {
    // render view template 
    res.render(process.cwd() + '/views/pug/profile', {username: req.user.username});
  });

  app.route('/logout').get((req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.route('/register').post(
    /** 1) Query the db w/err handling as middleware. If user exists, redirect to homepage;  
     * otherwise, insert user into db. If error here, redirect to homepage; otherwise, 
     * pass user to the next middleware for authentication.
     */
    (req, res, next) => {
      db.collection('users').findOne({ username: req.body.username }, function (err, user) {
        if(err) {
          next(err);
        } else if (user) {
          res.redirect('/');
        } else {
          let hash = bcrypt.hashSync(req.body.password, 12);
          db.collection('users').insertOne(
            {username: req.body.username, password: hash},
            (err, doc) => {
              if(err) {
                res.redirect('/');
              } else {
                next(null, user);
              }
            }
          );
        }
      });
    },

    /** 2) Authenticate user as middleware. Failure redirects to home page */
    passport.authenticate('local', { failureRedirect: '/' }),

    /** 3) Callback that redirects authenticated user to profile page */
    (req, res, next) => {
      res.redirect('/profile');
    }

  );

  // 404 middleware to catch requests for undefined routes
  app.use((req, res, next) => {
    res.status(404).type('text').send('Not Found');
  });

};