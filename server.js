import path from 'path';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import chalk from 'chalk';
import configureRoutes from './configureRoutes.js';

const app = express();

app.disable('x-powered-by');
app.set('port', process.env.PORT || 3000);

app.use(cors());
app.use(bodyParser.json());

if (app.settings.env === 'production') {
  app.use(compression());
  app.use(express.static(path.join(__dirname, '../static'), {
    maxAge: (60 * 60 * 1000),
  }));
  app.use(morgan('common'));
} else {
  app.use(express.static(path.join(__dirname, '../static')));
  app.use(morgan('dev'));
}

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
