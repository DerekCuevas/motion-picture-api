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
    seed.genres = genres;

    res.render('app', {
        seed: JSON.stringify(seed),
    });
}

// GET - /api/movies
export function queryMovies(req, res) {
    const query = req.query;
    const limit = parseInt(query.limit, 10);
    const offset = parseInt(query.offset, 10);

    if (query.genres) {
        query.genres = query.genres.split(',').map((genre) => {
            return genre.toLowerCase().trim();
        });
    }

    const result = toJs(movies.queryMovies(
        (limit * Math.sign(limit)) || DEFAULT_PAGE_LIMIT,
        (offset * Math.sign(offset)) || DEFAULT_PAGE_OFFSET,
        toClj(query.genres),
        query.category ? query.category.toLowerCase().trim() : '',
        query.q ? query.q.trim() : ''
    ));

    const pages = getPages(req, query, result);

    if (pages.next || pages.prev) {
        res.links(pages);
    }

    res.json({
        movies: result.movies,
        total: result.total,
    });
}

// GET - /api/movies/genres
export function getGenres(req, res) {
    res.json(genres);
}

// GET - /api/movies/:id
export function getMovie(req, res) {
    const id = req.params.id;
    const movie = toJs(movies.getMovie(id));

    if (!movie) {
        return res.status(404).json({
            message: `The movie "${id}" does not exist`,
        });
    }

    res.json(movie);
}

// FIXME: lowercase producer key

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

    const now = (new Date()).toISOString();
    val.movie.created_at = now;
    val.movie.updated_at = now;

    const newMovie = toJs(movies.createMovie(toClj(val.movie)));

    movies.save((err) => {
        if (err) {
            throw err;
        }
        res.location(`/api/movies/${newMovie.id}`);
        res.status(201).json(newMovie);
    });
}

// PUT - /api/movies/:id
export function updateMovie(req, res) {
    const id = req.params.id;

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

    val.movie.updated_at = (new Date()).toISOString();
    const updatedMovie = toJs(movies.updateMovie(id, toClj(val.movie)));

    if (!updatedMovie) {
        return res.status(404).json({
            message: `The movie "${id}" does not exist`,
        });
    }

    movies.save((err) => {
        if (err) {
            throw err;
        }
        res.json(updatedMovie);
    });
}

// DELETE - /api/movies/:id
export function deleteMovie(req, res) {
    const id = req.params.id;
    const removed = toJs(movies.deleteMovie(id));

    if (!removed) {
        return res.status(404).json({
            message: `The movie "${id}" does not exist`,
        });
    }

    movies.save((err) => {
        if (err) {
            throw err;
        }
        res.status(204).json();
    });
}
