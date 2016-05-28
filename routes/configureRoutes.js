import * as movies from '../controllers/movies';
import * as genres from '../controllers/genres';

export default function configureRoutes(app) {
  app.get('/api/movies', movies.index);
  app.get('/api/movies/genres', genres.get);
  app.get('/api/movies/:id', movies.get);
  app.post('/api/movies', movies.post);
  app.put('/api/movies/:id', movies.put);
  app.delete('/api/movies/:id', movies.del);
}
