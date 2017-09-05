const express = require('express');
const Snippet = require("../models/snippet");

const router = express.Router({mergeParams: true});

const addIndexToIngredients = function(snippet) {
    for (let idx = 0; idx < snippet.ingredients.length; idx++) {
        snippet.ingredients[idx].index = idx;
    }
}

const getSnippet = function(req, res, next) {
    Snippet.findOne({_id: req.params.id}).then(function(snippet) {
        req.snippet = snippet;
        next();
    })
}

router.use(getSnippet);

router.get('/', function(req, res) {
  res.render('index')
})

router.get('/new/', function(req,res) {
  res.render('new')
})

router.get('/login/', function(req,res) {
  res.render('login')
})

router.get('/snippet/:id', function(req,res) {
  res.send(req.params.id)
})

/*router.get('/', function(req, res) {
    const snippet = req.snippet;
    snippet.findSnippetsFromSameSource().then(function(otherSnippets) {
        res.render("snippet", {
            snippet: snippet,
            snippetsFromSameAuthor: otherSnippets
        });
    })
})*/



// router.get('/edit/', function(req, res) {
//     const snippet = req.snippet;
//     console.log(JSON.stringify(snippet.getFormData()));
//     addIndexToIngredients(snippet);
//     res.render("edit_snippet", {
//         snippet: snippet,
//         fields: snippet.getFormData(),
//         nextIngIndex: snippet.ingredients.length
//     });
// })

// router.post("/edit/", function(req, res) {
//     const snippet = req.snippet;
//     snippet.name = req.body.name;
//     snippet.source = req.body.source;
//     snippet.prepTime = req.body.prepTime;
//     snippet.cookTime = req.body.cookTime;
//
//     const ingredients = (req.body.ingredients || []).filter(function(ingredient) {
//         return (ingredient.amount || ingredient.measure || ingredient.ingredient)
//     });
//
//     snippet.ingredients = ingredients;
//
//     const error = snippet.validateSync();
//
//     if (error) {
//         addIndexToIngredients(snippet);
//         console.log(error.errors);
//         res.render("edit_snippet", {
//             snippet: snippet,
//             fields: snippet.getFormData(),
//             nextIngIndex: snippet.ingredients.length,
//             errors: error.errors
//         });
//     } else {
//         snippet.save();
//         res.redirect(`/${snippet._id}/`);
//     }
// })
//
// router.get('/new_ingredient/', function(req, res) {
//     res.render("new_ingredient", {snippet: req.snippet});
// })
//
// router.post('/new_ingredient/', function(req, res) {
//     const snippet = req.snippet;
//     snippet.ingredients.push(req.body);
//     snippet.save().then(function() {
//         res.render("new_ingredient", {snippet: snippet});
//     })
// })
//
// router.get('/new_step/', function(req, res) {
//     res.render("new_step", {snippet: req.snippet});
// })
//
// router.post('/new_step/', function(req, res) {
//     snippet.steps.push(req.body.step);
//     snippet.save().then(function() {
//         res.render("new_step", {snippet: snippet});
//     })
// })
//
// router.get('/new/', function(req, res) {
//     res.render('new_snippet');
// });
//
// router.post('/new/', function(req, res) {
//     Snippet.create(req.body).then(function(snippet) {
//         res.redirect('/');
//     }).catch(function(error) {
//         let errorMsg;
//         if (error.code === DUPLICATE_RECORD_ERROR) {
//             // make message about duplicate
//             errorMsg = `The snippet name "${req.body.name}" has already been used.`
//         } else {
//             errorMsg = "You have encountered an unknown error."
//         }
//         res.render('new_snippet', {errorMsg: errorMsg});
//     })
// });
//
// router.get('/', function(req, res) {
//     Snippet.find().then(function(snippets) {
//         res.render('index', {snippets: snippets});
//     })
// })

module.exports = router;
