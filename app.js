const fs = require('fs'),
  path = require('path'),
  express = require('express'),
  mustacheExpress = require('mustache-express'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  session = require('express-session'),
  bodyParser = require('body-parser'),
  models = require("./models"),
  flash = require('express-flash-messages'),
  mongoose = require('mongoose'),
  expressValidator = require('express-validator'),
  User = models.User,
  Snippet = models.Snippet,
  Recipe = models.Recipe; //delete this later

const DUPLICATE_RECORD_ERROR = 11000;
const app = express();

mongoose.connect('mongodb://localhost/snippetdb');

app.engine('mustache', mustacheExpress());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache')
app.set('layout', 'layout');
app.use('/static', express.static('static'));

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.authenticate(username, password, function(err, user) {
      if (err) {
        return done(err)
      }
      if (user) {
        return done(null, user)
      } else {
        return done(null, false, {
          message: "There is no user with that username and password."
        })
      }
    })
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(expressValidator());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: new(require('express-sessions'))({
    storage: 'mongodb',
    instance: mongoose, // optional
    host: 'localhost', // optional
    port: 27017, // optional
    db: 'test', // optional
    collection: 'sessions', // optional
    expire: 86400 // optional
  })
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
})

app.get('/', function(req, res) {
  res.render("index");
  // console.log("req.user.username",req.user.username);
  // console.log("res.locals.user.username",res.locals.user.username);
  // console.log("req.passport.user.username",req.passport.user.username); DOESN'T WORK
})

app.get('/login/', function(req, res) {
  res.render("login", {
    messages: res.locals.getMessages()
  });
});

app.post('/login/', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login/',
  failureFlash: true
}))

app.get('/register/', function(req, res) {
  res.render('register');
});

app.post('/register/', function(req, res) {
  req.checkBody('username', 'Username must be alphanumeric').isAlphanumeric();
  req.checkBody('username', 'Username must be lowercase').isLowercase();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();

  req.getValidationResult()
    .then(function(result) {
      if (!result.isEmpty()) {
        return res.render("register", {
          username: req.body.username,
          errors: result.mapped()
        });
      }
      const user = new User({
        username: req.body.username,
        password: req.body.password
      })

      const error = user.validateSync();
      if (error) {
        return res.render("register", {
          errors: normalizeMongooseErrors(error.errors)
        })
      }

      user.save(function(err) {
        if (err) {
          return res.render("register", {
            messages: {
              error: ["That username is already taken."]
            }
          })
        }
        return res.redirect('/');
      })
    })
});

function normalizeMongooseErrors(errors) {
  Object.keys(errors).forEach(function(key) {
    errors[key].message = errors[key].msg;
    errors[key].param = errors[key].path;
  });
}

app.get('/logout/', function(req, res) {
  req.logout();
  res.redirect('/');
});

const requireLogin = function(req, res, next) {
  if (req.user) {
    next()
  } else {
    res.redirect('/login/');
  }
}

const getSnippet = function(req, res, next) {
  Snippet.findOne({
    _id: req.params.id
  }).then(function(recipe) {
    req.snippet = snippet;
    next();
  })
}

// app.use(requireLogin);

app.get('/users/', requireLogin, function(req, res) {
  Snippet.distinct("author").then(function(snippet) {

    res.render("users", {
      snippet: snippet
    })

  })
})

app.get('/tagsbyuser/:username', requireLogin, function(req, res) {
  Snippet.find({
    author: req.params.username
  }).distinct("tags").then(function(snippet) {
    res.render("tagsbyuser", {
      snippet: snippet,
      username: req.params.username
    })
  })
})

app.get('/languagesbyuser/:username', requireLogin, function(req, res) {
  Snippet.find({
    author: req.params.username
  }).distinct("language").then(function(snippet) {
    res.render("languagesbyuser", {
      snippet: snippet,
      username: req.params.username
    })
  })
})

app.get('/snippets/', requireLogin, function(req, res) {
  Snippet.find().then(function(snippet) {
    res.render("many", {
      snippet: snippet
    });
  })
})

app.get('/tags/', requireLogin, function(req, res) {
  Snippet.distinct("tags").then(function(snippet) {
    res.render("tags", {
      snippet: snippet
    })
  })
})

app.get('/languages/', requireLogin, function(req, res) {
  Snippet.distinct("language").then(function(snippet) {
    res.render("languages", {
      snippet: snippet
    })
  })
})

app.get('/snippets/tag/:tag', requireLogin, function(req, res) {
  Snippet.find({
    tags: req.params.tag
  }).then(function(snippet) {
    res.render("many", {
      snippet: snippet
    })
  })
})

//   Snippet.find({ tags: { $elemMatch: req.params.tag } }).then(function(snippet){
//     res.render("many",{snippet:snippet});
//   }
// })


app.get('/snippets/language/:language', requireLogin, function(req, res) {
  Snippet.find({
    language: req.params.language
  }).then(function(snippet) {
    res.render("many", {
      snippet: snippet
    })
  })
})

app.get('/snippets/user/:username', requireLogin, function(req, res) {
  Snippet.find({
    author: req.params.username
  }).then(function(snippet) {
    res.render("many", {
      snippet: snippet
    });
  })
})

app.get('/snippets/user/:username/tag/:tag', requireLogin, function(req, res) {
  Snippet.find({
    author: req.params.username,
    tags: req.params.tag
  }).then(function(snippet) {
    res.render("many", {
      snippet: snippet
    });
  })
})

app.get('/snippets/user/:username/language/:language', requireLogin, function(req, res) {
  Snippet.find({
    author: req.params.username,
    language: req.params.language
  }).then(function(snippet) {
    res.render("many", {
      snippet: snippet
    });
  })
})

app.get('/snippets/id/:id', requireLogin, function(req, res) {
  Snippet.findOne({
    _id: req.params.id
  }).then(function(snippet) {
    res.render("one", {
      snippet: snippet,
      starred: snippet.stars.includes(res.locals.user.username),
      mine: (snippet.author == res.locals.user.username)
    })
  })
})

app.post('/delete/', requireLogin, function(req,res) {
  Snippet.remove({
    _id: req.body.id
  }).then(
    res.redirect('/')
  )
})

app.get('/create/', requireLogin, function(req, res) {
  res.render("create");
})

app.post('/star/', requireLogin, function(req, res) {
  console.log(req.body.id);
  Snippet.findOne({
    _id: req.body.id
  }).then(function(snippet) {
    // If the stars list already includes the user, it removes all instances from the stars list (there should be only one but this is bug proofing)
    console.log(res.locals.user.username);
    console.log(snippet.stars.includes(res.locals.user.username));
    if (snippet.stars.includes(res.locals.user.username)) {
      i = 0;
      while (i < snippet.stars.length) {
        console.log(i);
        if (snippet.stars[i] == res.locals.user.username) {
          snippet.stars.splice(i, 1);
        } else {
          i++
        }
      }
    }
    // Otherwise, it adds the user to the stars list
    else {
      snippet.stars.push(res.locals.user.username);
    }

    snippet.save()
    res.redirect(`/snippets/id/${req.body.id}/`)
  })
})

app.post('/create/', function(req, res) {
  console.log(req.body);
  req.body.author = res.locals.user.username;
  tagArray = req.body.tagsRaw.split(" ");
  let i = 0
  while (i < tagArray.length) {
    if (tagArray[i] == "") {
      tagArray.splice(i, 1);
    } else {
      i++
    }
  }

  req.body.tags = tagArray;

  Snippet.create(req.body)
    .then(function(snippet) {
      console.log(snippet);
      res.redirect('/');
    })
})

app.listen(3000, function() {
  console.log('Express running on http://localhost:3000/.')
});
