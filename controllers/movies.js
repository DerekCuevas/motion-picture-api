import Joi from 'joi';
import pick from 'lodash.pick';
import {DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, FIRST_PAGE} from '../config';
import {
    queryMovies,
    getMovie,
    createMovie,
    updateMovie,
    deleteMovie,
    query,
    update,
} from '../models/movies';
import getLinks from '../util/getLinks';
import {schema} from '../models/movie.schema';

export function index(req, res) {
    const {
        genres,
        category,
        text,
        page = FIRST_PAGE,
        size = DEFAULT_PAGE_SIZE,
    } = req.query;

    query(queryMovies, {
        genres,
        category,
        text,
        page: parseInt(page, 10),
        size: parseInt(size, 10) < MAX_PAGE_SIZE ? parseInt(size, 10) : MAX_PAGE_SIZE,
    }).then(({movies, total, pages}) => {
        if (pages.next || pages.previous) {
            res.links(getLinks(req, pages));
        }

        res.json({movies, total});
    }).catch(({status, error}) => {
        if (status === 500) {
            res.status(500).json({
                error,
                message: '500 server error',
            });
        }
    });
}

export function get({params: {id}}, res) {
    query(getMovie, id).then(movie => {
        res.json(movie);
    }).catch(({status, error}) => {
        if (status === 404) {
            res.status(404).json({
                message: `The movie by id: "${id}" does not exist`,
            });
        } else if (status === 500) {
            res.status(500).json({
                error,
                message: '500 server error',
            });
        }
    });
}

export function post({body: movie}, res) {
    const now = (new Date()).toISOString();
    const validation = Joi.validate(movie, schema, {abortEarly: false});

    if (validation.error) {
        return res.status(422).json({
            message: 'Validation Failed',
            errors: validation.error.details.map(e => ({
                field: e.path,
                message: e.message,
            })),
        });
    }

    update(createMovie, movie, now).then(created => {
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

export function put({params: {id}, body: movie}, res) {
    const now = (new Date()).toISOString();
    const validation = Joi.validate(
        movie,
        pick(schema, Object.keys(movie)),
        {abortEarly: false}
    );

    if (validation.error) {
        return res.status(422).json({
            message: 'Validation Failed',
            errors: validation.error.details.map(e => ({
                field: e.path,
                message: e.message,
            })),
        });
    }

    update(updateMovie, id, movie, now).then(updated => {
        res.json(updated);
    }).catch(({status, error}) => {
        if (status === 404) {
            res.status(404).json({
                message: `The movie by id: "${id}" does not exist`,
            });
        } else if (status === 500) {
            res.status(500).json({
                error,
                message: '500 server error',
            });
        }
    });
}

export function del({params: {id}}, res) {
    update(deleteMovie, id).then(() => {
        res.status(204).json();
    }).catch(({status, error}) => {
        if (status === 404) {
            res.status(404).json({
                message: `The movie by id: "${id}" does not exist`,
            });
        } else if (status === 500) {
            res.status(500).json({
                error,
                message: '500 server error',
            });
        }
    });
}
