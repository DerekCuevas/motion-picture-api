import express from 'express';
import exphbs from 'express-handlebars';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import chalk from 'chalk';
import configureRoutes from './configureRoutes.js';

const app = express();

// view engine config
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
}));
app.set('view engine', '.hbs');

// other app presets / middleware
app.disable('x-powered-by');

app.set('port', process.env.PORT || 3000);

// should do this in prod...
// app.use(express.static('./static', {maxAge: 31557600000}));
app.use(express.static('./static'));

app.use(bodyParser.json());
app.use(morgan('dev'));

// configure all routes for the API
configureRoutes(app);

app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

app.use((err, req, res) => {
    res.status(500).send('500 Server Error');
});

app.listen(app.get('port'), () => {
    console.log(chalk.bold.blue(
        `=> app in ${app.get('env')} at http://localhost:${app.get('port')}`
    ));
});
