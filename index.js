const Client = require('node-rest-client').Client;
const port = process.env.PORT || 8000;
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const hbs = exphbs.create({defaultLayout: 'main'});
const bodyParser = require('body-parser');
const client = new Client();
const router = express.Router();
const async = require('async');
const path = require('path');

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.use(express.static(port + '/public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(port);
process.setMaxListeners(20);

app.get('/', function(req, res) {
    res.render('index', {
        title: 'What Happened?'
        });
});

app.post('/', function(req, res) {
    const date = req.body.date;
    if(isValidDate(date)) {
        const monthArr = date.split('/');
        const args = {path: {'month': monthArr[0], 'day': monthArr[1], 'year': monthArr[2]}};
        async.waterfall([
            function(callback) {
                client.get('http://numbersapi.com/${month}/${day}/date', args, function(request, response) {
                    callback(null, request);
                }).on('error', function (err) {
                    console.log('Something went wrong on the request', err.malUserData.options);
                });
                client.on('error', function (err) {
                    console.log('Something went wrong on the client', err);
                });
            },
            function(monthDayFact, callback) {
                client.get('http://numbersapi.com/${year}/year', args, function(request, response) {
                    callback(null, monthDayFact, request);
                }).on('error', function (err) {
                    console.log('Something went wrong on the request', err.malUserData.options);
                });
                client.on('error', function (err) {
                    console.log('Something went wrong on the client', err);
                });
            },
            function(monthDayFact, yearFact, callback) {
                res.render('search-result', {
                    title: "What Happened on " + monthArr[0] + "/" + monthArr[1] + "/" + monthArr[2] + "?",
                    msg: monthDayFact,
                    year: yearFact
                });
                callback(null, 'done');
            }
        ], function (err, result) {
        });
    }
    else {
        res.render('search-result', {
            title: "Oops!",
            msg: "\"" + req.body.date + "\" is not a valid date!",
            year: "Please try again, and put your number in the format MM/DD/YYYY"
        });
    }
});

function isValidDate(date) {
    const date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/ ;
    return date_regex.test(date);
}