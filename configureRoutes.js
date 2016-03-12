import sendApp from './controllers/app';
import * as movies from './controllers/movies';

export default function configureRoutes(app) {
  app.get('/', sendApp);
  app.get('/movies/:id', sendApp);

  app.get('/api/movies', movies.index);
  app.get('/api/movies/:id', movies.get);
  app.post('/api/movies', movies.post);
  app.put('/api/movies/:id', movies.put);
  app.delete('/api/movies/:id', movies.del);
}
