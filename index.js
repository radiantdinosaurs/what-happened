const port = process.env.PORT || 8000;
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const hbs = exphbs.create({ defaultLayout: 'main' });
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.use(express.static(port + '/public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(port);

const API_BASE = (day, month) => `http://numbersapi.com/${day}/${month}/date`
const PAGE_TITLE = 'What Happened?'

app.get('/', function (request, response) {
    response.render('index', {
        title: PAGE_TITLE
    });
});

app.post('/', function (request, response) {
    const date = request.body.date;
    if (testIsValidInput(date)) {
        const dateArray = date.split('/');
        const day = dateArray[0];
        const month = dateArray[1];

        fetch(API_BASE(day, month))
            .then((response) => response.text())
            .then((dateFact) => {
                response.render('search-result', {
                    title: PAGE_TITLE,
                    msg: dateFact
                });
            })
            .catch((error) => {
                console.log('Whoops, got an error: ', error)
            })
    }
    else {
        const invalidDate = request.body.date;
        response.render('search-result', {
            title: "Oops!",
            msg: `${invalidDate} is not a valid date!`,
            year: "Please try again, and put your number in the format MM/DD"
        });
    }
});

/**
 * Tests if the input is in the format of MM/DD
 * @param {String} date - Expected to be MM/DD
 */
const testIsValidInput = (date) => {
    const validDayAndMonth = /^((0[1-9])|(1[0-2]))\/(\d{2})$/;
    return validDayAndMonth.test(date);
}