import Joi from 'joi';
import qs from 'qs';
import _ from 'lodash';
import Movies from '../models/Movies';
import {schema, genres} from '../models/Movie.schema';
import titleCase from '../util/titleCase';

const DEFAULT_PAGE_LIMIT = 10;
const DEFAULT_PAGE_OFFSET = 0;

const movies = new Movies();

function normalize(body) {
    if (body.genre) {
        body.genre = body.genre.toLowerCase().trim();
    }

    if (body.producer) {
        body.producer = body.producer.toLowerCase().trim();
    }

    return body;
}

function validate(movie, fields) {
    const val = Joi.validate(movie, fields, {
        abortEarly: false,
    });

    if (val.error) {
        return {
            error: true,
            message: 'Validation Failed',
            errors: val.error.details.map(err => {
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

function getPages(req, query, result) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const pages = {};
    const params = {
        limit: result.pages.limit,
        genres: query.genres,
        category: query.category,
        q: query.q,
    };

    if (result.pages.next) {
        params.offset = result.pages.next.offset;
        pages.next = `${baseUrl}/api/movies?${qs.stringify(params)}`;
    }

    if (result.pages.prev) {
        params.offset = result.pages.prev.offset;
        pages.prev = `${baseUrl}/api/movies?${qs.stringify(params)}`;
    }

    return pages;
}

// GET - / (serves the main app)
export function index(req, res) {
    const seed = movies.queryMovies(DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_OFFSET);
    seed.pages = getPages(req, {}, seed);
    seed.genres = genres.map(titleCase);

    res.render('app', {
        seed: JSON.stringify(seed),
    });
}

// GET - /api/movies
export function queryMovies(req, res) {
    const query = req.query;
    const limit = parseInt(query.limit, 10);
    const offset = parseInt(query.offset, 10);

    let filterGenres = [];

    if (query.genres) {
        filterGenres = query.genres.split(',').map(genre => {
            return genre.toLowerCase().trim();
        });
    }

    const result = movies.queryMovies(
        (limit * Math.sign(limit)) || DEFAULT_PAGE_LIMIT,
        (offset * Math.sign(offset)) || DEFAULT_PAGE_OFFSET,
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

// GET - /api/movies/genres
export function getGenres(req, res) {
    res.json(genres.map(titleCase));
}

// GET - /api/movies/:id
export function getMovie(req, res) {
    const id = req.params.id;
    const movie = movies.getMovie(id);

    if (!movie) {
        return res.status(404).json({
            message: `The movie by id: "${id}" does not exist`,
        });
    }

    res.json(movie);
}

// POST - /api/movies
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

// PUT - /api/movies/:id
export function updateMovie(req, res) {
    const id = req.params.id;

    req.body = normalize(req.body);
    const val = validate(req.body, _.pick(schema, _.keys(req.body)));

    if (val.error) {
        return res.status(422).json({
            message: val.message,
            errors: val.errors,
        });
    }

    val.movie.updated_at = (new Date()).toISOString();
    const updatedMovie = movies.updateMovie(id, val.movie);

    if (!updatedMovie) {
        return res.status(404).json({
            message: `The movie by id: "${id}" does not exist`,
        });
    }

    movies.save(err => {
        if (err) {
            throw err;
        }
        res.json(updatedMovie);
    });
}

// DELETE - /api/movies/:id
export function deleteMovie(req, res) {
    const id = req.params.id;
    const removed = movies.deleteMovie(id);

    if (!removed) {
        return res.status(404).json({
            message: `The movie by id: "${id}" does not exist`,
        });
    }

    movies.save(err => {
        if (err) {
            throw err;
        }
        res.status(204).json();
    });
}
