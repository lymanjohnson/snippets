const fs = require('fs');
const path = require('path');
const express = require('express');
const mustacheExpress = require('mustache-express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const Snippet = require("./models/snippet");
const snippetRouter = require("./routers/snippet");

const DUPLICATE_RECORD_ERROR = 11000;

const mongoURL = 'mongodb://localhost:27017/snippets';
mongoose.connect(mongoURL, {useMongoClient: true});
mongoose.Promise = require('bluebird');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.engine('mustache', mustacheExpress());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache')
app.set('layout', 'layout');

app.use('/static', express.static('static'));
app.use('',snippetRouter);

module.exports = app;



/* REDUNDANT ??
app.get('/new/', function(req, res) {
    res.render('new_snippet');
});

app.post('/new/', function(req, res) {
    Snippet.create(req.body).then(function(snippet) {
        res.redirect('/');
    }).catch(function(error) {
        let errorMsg;
        if (error.code === DUPLICATE_RECORD_ERROR) {
            // make message about duplicate
            errorMsg = `The snippet name "${req.body.name}" has already been used.`
        } else {
            errorMsg = "You have encountered an unknown error."
        }
        res.render('new_snippet', {errorMsg: errorMsg});
    })
});

app.get('/', function(req, res) {
    Snippet.find().then(function(snippets) {
        res.render('index', {snippets: snippets});
    })
})
*/
