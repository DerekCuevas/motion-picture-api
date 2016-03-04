import {getMovie, query} from '../models/movies';

// GET - /api/movies/:id
export function get({params: {id}}, res) {
    query(getMovie, id).then(movie => {
        res.json(movie);
    }).catch(({status}) => {
        if (status === 404) {
            res.status(404).json({
                message: `The movie by id: "${id}" does not exist`,
            });
        }
    });
}

/*

// GET - /api/movies
export function queryMovies(req, res) {
    const query = req.query;
    let filterGenres = [];

    if (query.genres) {
        filterGenres = query.genres.split(',').map(genre => {
            return genre.toLowerCase().trim();
        });
    }

    const result = movies.queryMovies(
        normalizeInt(query.limit) || DEFAULT_PAGE_LIMIT,
        normalizeInt(query.offset) || DEFAULT_PAGE_OFFSET,
        filterGenres,
        query.category ? query.category.toLowerCase().trim() : '',
        query.q ? query.q.trim() : ''
    );

    const pages = getPages(req, query, result);

    if (pages.next || pages.prev) {
        res.links(pages);
    }

    res.json({
        movies: result.movies,
        total: result.total,
    });
}

*/
