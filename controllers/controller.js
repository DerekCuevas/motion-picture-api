import qs from 'qs';
import {
    queryMovies,
    getMovie,
    createMovie,
    query,
    update,
} from '../models/movies';

function getLinks(req, {next, previous}) {
    const base = `${req.protocol}://${req.get('host')}`;
    const links = {};

    if (next) {
        links.next = `${base}/api/movies?${qs.stringify(next)}`;
    }

    if (previous) {
        links.previous = `${base}/api/movies?${qs.stringify(previous)}`;
    }

    return links;
}

export function index(req, res) {
    const {page = 1, size = 10, genres = [], category, text} = req.query;

    query(queryMovies, {
        genres,
        category,
        text,
        page: parseInt(page, 10),
        size: parseInt(size, 10),
    }).then(({movies, total, pages}) => {
        if (pages.next || pages.previous) {
            res.links(getLinks(req, pages));
        }

        res.json({movies, total});
    });
}

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

// TODO: add validation
export function post({body: movie}, res) {
    update(createMovie, movie, (new Date()).toISOString()).then(created => {
        res.location(`/api/movies/${created.id}`)
            .status(201)
            .json(created);
    }).catch(({status, error}) => {
        if (status === 500) {
            res.status(500).json({
                error,
                message: '500 server error',
            });
        }
    });
}

/*
export function createMovie(req, res) {
    req.body = normalize(req.body);
    const val = validate(req.body, schema);

    if (val.error) {
        return res.status(422).json({
            message: val.message,
            errors: val.errors,
        });
    }

    const now = (new Date()).toISOString();
    val.movie.created_at = now;
    val.movie.updated_at = now;

    const newMovie = movies.createMovie(val.movie);

    movies.save(err => {
        if (err) {
            throw err;
        }
        res.location(`/api/movies/${newMovie.id}`);
        res.status(201).json(newMovie);
    });
}
 */
