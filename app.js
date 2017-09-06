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
    User = models.User;

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

app.use(function (req, res, next) {
  res.locals.user = req.user;
  next();
})

app.get('/', function(req, res) {
    res.render("index");
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

const requireLogin = function (req, res, next) {
  if (req.user) {
    next()
  } else {
    res.redirect('/login/');
  }
}

const addIndexToIngredients = function(recipe) {
    for (let idx = 0; idx < recipe.ingredients.length; idx++) {
        recipe.ingredients[idx].index = idx;
    }
}

const getRecipe = function(req, res, next) {
    Recipe.findOne({_id: req.params.id}).then(function(recipe) {
        req.recipe = recipe;
        next();
    })
}

app.use(requireLogin);

app.get('/secret/', function (req, res) {
  res.render("secret");
})

// app.use(getRecipe);

app.get('/rindex', function(req, res) {
  res.send("rindex");
    // const recipe = req.recipe;
    // recipe.findRecipesFromSameSource().then(function(otherRecipes) {
    //     res.render("recipe", {
    //         recipe: recipe,
    //         recipesFromSameSource: otherRecipes
    //     });
    // })
})

app.get('/edit/', function(req, res) {
    const recipe = req.recipe;
    console.log(JSON.stringify(recipe.getFormData()));
    addIndexToIngredients(recipe);
    res.render("edit_recipe", {
        recipe: recipe,
        fields: recipe.getFormData(),
        nextIngIndex: recipe.ingredients.length
    });
})

app.post("/edit/", function(req, res) {
    const recipe = req.recipe;
    recipe.name = req.body.name;
    recipe.source = req.body.source;
    recipe.prepTime = req.body.prepTime;
    recipe.cookTime = req.body.cookTime;

    const ingredients = (req.body.ingredients || []).filter(function(ingredient) {
        return (ingredient.amount || ingredient.measure || ingredient.ingredient)
    });

    recipe.ingredients = ingredients;

    const error = recipe.validateSync();

    if (error) {
        addIndexToIngredients(recipe);
        console.log(error.errors);
        res.render("edit_recipe", {
            recipe: recipe,
            fields: recipe.getFormData(),
            nextIngIndex: recipe.ingredients.length,
            errors: error.errors
        });
    } else {
        recipe.save();
        res.redirect(`/${recipe._id}/`);
    }
})

app.get('/new_ingredient/', function(req, res) {
    res.render("new_ingredient", {recipe: req.recipe});
})

app.post('/new_ingredient/', function(req, res) {
    const recipe = req.recipe;
    recipe.ingredients.push(req.body);
    recipe.save().then(function() {
        res.render("new_ingredient", {recipe: recipe});
    })
})

app.get('/new_step/', function(req, res) {
    res.render("new_step", {recipe: req.recipe});
})

app.post('/new_step/', function(req, res) {
    recipe.steps.push(req.body.step);
    recipe.save().then(function() {
        res.render("new_step", {recipe: recipe});
    })
})

app.listen(3000, function() {
    console.log('Express running on http://localhost:3000/.')
});
