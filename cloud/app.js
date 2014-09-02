
// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var parseExpressCookieSession = require('parse-express-cookie-session');
var parseExpressHttpsRedirect = require('parse-express-https-redirect');

var app = express();

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine

app.use(express.bodyParser());    // Middleware for reading request body
app.use(express.cookieParser('COOKIE_SECRET'));
app.use(parseExpressCookieSession({ cookie: { maxAge: 3600000 } }));
app.use(parseExpressHttpsRedirect());
// app.use(express.csrf());
// app.use(express.basicAuth());

app.get('/signup', function(req, res) {
    res.render('signup');
});

app.post('/signup', function(req, res) {
    var user = new Parse.User();
    user.set("username", req.body.username);
    user.set("password", req.body.password);
    user.set("email", req.body.email);

    user.signUp(null, {
      success: function(user) {
        // Hooray! Let them use the app now.
        if (Parse.User.current()) {
            res.redirect('/');
        }
        else {
            res.send('Not setting cookie for logged in user');
        }
      },
      error: function(user, error) {
        // Show the error message somewhere and let the user try again.
        alert("Error: " + error.code + " " + error.message);
        res.send('Error ' + error.message + ' <a href="/signup">Try again</a>');
      }
    });
});

app.get('/login', function(req, res) {
    if (Parse.User.current()) {
        // Render the user profile information (e.g. email, phone, etc).
        res.send('Already logged in! <a href="/">Home</a>');
    }
    else {
        res.render('login');
    }
});

app.post('/login', function(req, res) {
    Parse.User.logIn(req.body.username, req.body.password, {
        success: function(user) {
            // Do stuff after successful login.
            res.render('index', { message: "Logged in as " + Parse.User.current().getUsername() + ", whose email is " + Parse.User.current().get('email') + "!" });
        },
          error: function(user, error) {
            // The login failed. Check error to see why.
            alert("Error: " + error.code + " " + error.message);
            console.log("Error: " + error.code + " " + error.message);
        }
    });
});

app.get('/', function(req, res) {
    var current_user = Parse.User.current();
    if (current_user) {
        // Render the user profile information (e.g. email, phone, etc).
        res.render('index', { message: 'Logged in as ' + Parse.User.current().getUsername()});    
    }
    else {
        res.render('index', { message: 'Ayyy you\'re on the Flipbread homepage!' });
    }
});

// This is an example of hooking up a request handler with a specific request
// path and HTTP verb using the Express routing API.
app.get('/hello', function(req, res) {
  res.render('hello', { message: 'Change this dum msg!' });
});

app.post('/hello', function(req, res) {
  res.render('hello', { message: req.body.message });
});

app.get('/profile', function(req, res) {
    // Display the user profile if user is logged in.
    user = Parse.User.current();
    if (user) {
      // We need to fetch because we need to show fields on the user object.
        // Render the user profile information (e.g. email, phone, etc).
        res.send('Username: ' + user.getUsername());
      } else {
      // User not logged in, redirect to login form.
      res.redirect('/login');
    }
  });

app.get('/logout', function(req, res) {
    Parse.User.logOut();
    res.redirect('/');
});

// // Example reading from the request query string of an HTTP get request.
// app.get('/test', function(req, res) {
//   // GET http://example.parseapp.com/test?message=hello
//   res.send(req.query.message);
// });

// // Example reading from the request body of an HTTP post request.
// app.post('/test', function(req, res) {
//   // POST http://example.parseapp.com/test (with request body "message=hello")
//   res.send(req.body.message);
// });

// Attach the Express app to Cloud Code.
app.listen();
