import Joi from 'joi';
import qs from 'qs';
import {toClj, toJs} from 'mori';
import _ from 'lodash';
import Movies from '../models/Movies';
import {schema, genres} from '../models/Movie.schema';

const DEFAULT_PAGE_LIMIT = 10;
const DEFAULT_PAGE_OFFSET = 0;

const movies = new Movies();

function getPages(req, query, result) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const pages = {};

    if (result.pages.next) {
        const next = qs.stringify({
            limit: result.pages.limit,
            offset: result.pages.next.offset,
            genres: query.genres,
            category: query.category,
            q: query.q,
        });
        pages.next = `${baseUrl}/api/movies?${next}`;
    }

    if (result.pages.prev) {
        const prev = qs.stringify({
            limit: result.pages.limit,
            offset: result.pages.prev.offset,
            genres: query.genres,
            category: query.category,
            q: query.q,
        });
        pages.prev = `${baseUrl}/api/movies?${prev}`;
    }

    return pages;
}

function validate(movie, fields) {
    const val = Joi.validate(movie, fields, {
        abortEarly: false,
    });

    if (val.error) {
        return {
            error: true,
            message: 'Validation Failed',
            errors: val.error.details.map((err) => {
                return {
                    field: err.path,
                    message: err.message,
                };
            }),
        };
    }

    return {
        error: false,
        movie: val.value,
    };
}

// GET - / (serves the main app)
export function index(req, res) {
    const seed = toJs(movies.queryMovies(DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_OFFSET));
    seed.pages = getPages(req, {}, seed);

    res.render('app', {
        seed: JSON.stringify(seed),
    });
}

// GET - /api/movies
export function queryMovies(req, res) {
    const query = req.query;

    if (query.genres) {
        query.genres = query.genres.split(',').map((genre) => {
            return genre.toLowerCase().trim();
        });
    }

    const result = toJs(movies.queryMovies(
        parseInt(query.limit, 10) || DEFAULT_PAGE_LIMIT,
        parseInt(query.offset, 10) || DEFAULT_PAGE_OFFSET,
        toClj(query.genres),
        query.category ? query.category.toLowerCase().trim() : '',
        query.q ? query.q.trim() : ''
    ));

    // FIXME: don't set links if pages empty?
    res.links(getPages(req, query, result));
    res.json({
        movies: result.movies,
        total: result.total,
    });
}

// GET - /api/movies/genres
export function getGenres(req, res) {
    res.json(genres);
}

// GET - /api/movies/:sku
export function getMovie(req, res) {
    const sku = req.params.sku;
    const movie = toJs(movies.getMovie(sku));

    if (!movie) {
        return res.status(404).json({
            message: `The movie "${sku}" does not exist`,
        });
    }

    res.json(movie);
}

// POST - /api/movies
export function createMovie(req, res) {
    if (req.body.genre) {
        req.body.genre = req.body.genre.toLowerCase().trim();
    }

    const val = validate(req.body, schema);

    if (val.error) {
        return res.status(422).json({
            message: val.message,
            errors: val.errors,
        });
    }

    const newMovie = toJs(movies.createMovie(toClj(val.movie)));

    movies.save((err) => {
        if (err) {
            throw err;
        }
        res.location(`/api/movies/${newMovie.sku}`);
        res.status(201).json(newMovie);
    });
}

// PUT - /api/movies/:sku
export function updateMovie(req, res) {
    const sku = req.params.sku;

    if (req.body.genre) {
        req.body.genre = req.body.genre.toLowerCase().trim();
    }

    const val = validate(req.body, _.pick(schema, _.keys(req.body)));

    if (val.error) {
        return res.status(422).json({
            message: val.message,
            errors: val.errors,
        });
    }

    const updatedMovie = toJs(movies.updateMovie(sku, toClj(val.movie)));

    if (!updatedMovie) {
        res.status(404).json({
            message: `The movie "${sku}" does not exist`,
        });
    } else {
        movies.save((err) => {
            if (err) {
                throw err;
            }
            res.json(updatedMovie);
        });
    }
}

// DELETE - /api/movies/:sku
export function deleteMovie(req, res) {
    const sku = req.params.sku;
    const removed = toJs(movies.deleteMovie(sku));

    if (!removed) {
        res.status(404).json({
            message: `The movie "${sku}" does not exist`,
        });
    } else {
        movies.save((err) => {
            if (err) {
                throw err;
            }
            res.status(204).json();
        });
    }
}
