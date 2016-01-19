import * as movies from './controllers/moviesController';

export default function configureRoutes(app) {
    // The app
    app.get('/', movies.index);
    app.get('/movies/:id', movies.index);

    // The API routes, move /api behind express router?
    app.get('/api/movies', movies.queryMovies);
    app.get('/api/movies/genres', movies.getGenres);
    app.get('/api/movies/:id', movies.getMovie);
    app.post('/api/movies', movies.createMovie);
    app.put('/api/movies/:id', movies.updateMovie);
    app.delete('/api/movies/:id', movies.deleteMovie);
}
