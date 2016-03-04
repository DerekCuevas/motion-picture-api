import * as movies from './controllers/controller';

export default function configureRoutes(app) {
    app.get('/api/movies', movies.index);
    app.get('/api/movies/:id', movies.get);
    app.post('/api/movies', movies.post);
    app.put('/api/movies/:id', movies.put);
    app.delete('/api/movies/:id', movies.del);

    /*
    // The app (handled by react-router on the client)
    app.get('/', movies.index);
    app.get('/movies/:id', movies.index);

    // The API routes
    // FIXME: move /api behind express router?
    app.get('/api/movies', movies.queryMovies);
    app.get('/api/movies/genres', movies.getGenres);
    app.get('/api/movies/:id', movies.getMovie);
    app.post('/api/movies', movies.createMovie);
    app.put('/api/movies/:id', movies.updateMovie);
    app.delete('/api/movies/:id', movies.deleteMovie);
    */
}
