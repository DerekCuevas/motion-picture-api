import * as movies from './controllers/movies';

export default function configureRoutes(app) {
    // The app
    app.get('/', movies.index);

    // The API routes, move /api behind express router?
    app.get('/api/movies', movies.queryMovies);
    app.get('/api/movies/genres', movies.getGenres);
    app.get('/api/movies/:sku', movies.getMovie);
    app.post('/api/movies', movies.createMovie);
    app.put('/api/movies/:sku', movies.updateMovie);
    app.delete('/api/movies/:sku', movies.deleteMovie);
}
