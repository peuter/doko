var express = require('express');
var path = require('path');
// Pull information from HTML POST (express 4)
var bodyParser = require('body-parser');
// Simulate DELETE and PUT (Express 4)
var methodOverride = require('method-override');
// PassportJS
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var cookieParser = require('cookie-parser');
var session = require('express-session');
var results = require('./routes/results');
var users = require('./routes/users');
var model = require('./models');

var app = express();

// Read cookies (needed for authentication)
app.use(cookieParser());
// Parse application/json
app.use(bodyParser.json());
// Parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Override with the X-HTTP-Method-Override header in the request. Simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

// ## Passport JS

passport.use(new BasicStrategy(
  function(username, password, callback) {
    model.User.findOne({
      where: {
        username: username
      }
    }).then(function (user) {
      if (!user) {
        return callback(null, false);
      }

      user.verifyPassword(password, function(err, isMatch) {
        if (err) {
          return callback(err);
        }

        if (!isMatch) {
          return callback(null, false);
        }

        // Success
        return callback(null, user);
      });
    }).catch(function(err) {
      return callback(err);
    });
  },
  function(params, done) {
    // validate nonces as necessary
    done(null, true)
  }
));

// Session secret
// app.use(session({
//
//   secret : process.env.SESSION_SECRET,
//
//   resave : true,
//
//   saveUninitialized : true
// }));
app.use(passport.initialize());
//
// // Persistent login sessions
// app.use(passport.session());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
  next();
});

app.use('/api/', users);
app.use('/api/results', results);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log(err);
});


module.exports = app;
