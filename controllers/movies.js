import Joi from 'joi';
import pick from 'lodash.pick';
import {DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, FIRST_PAGE} from '../config';
import getLinks from '../util/getLinks';
import {schema} from '../models/movie.schema';
import {
    queryMovies,
    getMovie,
    createMovie,
    updateMovie,
    deleteMovie,
    query,
    update,
} from '../models/movies';

function handleError(res, id = '') {
    return ({status, error}) => {
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
    };
}

function getValidationErrors(error) {
    return {
        errors: error.details.map(e => ({
            field: e.path,
            message: e.message,
        })),
    };
}

export function index(req, res) {
    const {
        genres,
        category,
        query: text,
        page = FIRST_PAGE,
        size = DEFAULT_PAGE_SIZE,
    } = req.query;

    query(queryMovies, {
        genres,
        category,
        text,
        page: parseInt(page, 10),
        size: size < MAX_PAGE_SIZE ? parseInt(size, 10) : MAX_PAGE_SIZE,
    }).then(({movies, total, pages}) => {
        if (pages.next || pages.previous) {
            res.links(getLinks(req, pages));
        }

        res.json({movies, total});
    }).catch(handleError(res));
}

export function get({params: {id}}, res) {
    query(getMovie, id).then(movie => {
        res.json(movie);
    }).catch(handleError(res, id));
}

export function post({body: movie}, res) {
    const {error} = Joi.validate(movie, schema, {abortEarly: false});

    if (error) {
        return res.status(422).json(getValidationErrors(error));
    }

    const now = (new Date()).toISOString();

    update(createMovie, movie, now).then(created => {
        res.location(`/api/movies/${created.id}`)
            .status(201)
            .json(created);
    }).catch(handleError(res));
}

export function put({params: {id}, body: movie}, res) {
    const {error} = Joi.validate(
        movie,
        pick(schema, Object.keys(movie)),
        {abortEarly: false}
    );

    if (error) {
        return res.status(422).json(getValidationErrors(error));
    }

    const now = (new Date()).toISOString();

    update(updateMovie, id, movie, now).then(updated => {
        res.json(updated);
    }).catch(handleError(res, id));
}

export function del({params: {id}}, res) {
    update(deleteMovie, id).then(() => {
        res.status(204).json();
    }).catch(handleError(res, id));
}
