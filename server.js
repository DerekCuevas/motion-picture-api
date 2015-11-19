import express from 'express';
import exphbs from 'express-handlebars';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import chalk from 'chalk';
import configureRoutes from './routes.js';

const app = express();

// rendering engine config, maybe move views to root dir?
app.engine('.hbs', exphbs({
    defaultLayout: 'index',
    extname: '.hbs',
    layoutsDir: './api/views/layouts/',
}));
app.set('views', './api/views');
app.set('view engine', '.hbs');

// other app presets / middleware
app.disable('x-powered-by');
app.set('port', process.env.PORT || 3000);
app.use(express.static('./build'));

app.use(bodyParser.json());
app.use(morgan('dev'));

// configure all routes for the API
configureRoutes(app);

app.use((req, res) => {
    res.status(404).send('404');
});

app.use((err, req, res) => {
    console.error(chalk.bold.red(err));
    res.status(500).send('500');
});

app.listen(app.get('port'), () => {
    console.log(chalk.bold.blue(
        `=> app in ${app.get('env')} at http://localhost:${app.get('port')}`
    ));
});
