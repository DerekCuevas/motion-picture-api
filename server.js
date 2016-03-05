import express from 'express';
import cors from 'cors';
import compression from 'compression';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import chalk from 'chalk';
import configureRoutes from './configureRoutes.js';

const app = express();

// app presets / middleware
app.disable('x-powered-by');
app.set('port', process.env.PORT || 3000);

// should do this in prod...
// app.use(express.static('./static', {maxAge: 31557600000}));
app.use(express.static('./static'));

// prod
app.use(compression());

// dev
app.use(morgan('dev'));

app.use(cors());
app.use(bodyParser.json());

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
