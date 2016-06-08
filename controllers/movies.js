import { validate } from 'joi';
import pick from 'lodash.pick';
import { DEFAULT_LIMIT, MAX_LIMIT, FIRST_PAGE } from '../config';
import getLinks from '../util/getLinks';
import { schema } from '../models/movie.schema';

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
  return error => {
    if (error.status === 404) {
      res.status(404).json({ message: `The movie by id: "${id}" does not exist` });
    } else {
      res.status(500).json({ message: '500 server error' });
    }
  };
}

function getValidationErrors(error) {
  return error.details.map(e => ({
    field: e.path,
    message: e.message,
  }));
}

export function index(req, res) {
  const {
    genres,
    category,
    q,
    p = FIRST_PAGE,
    limit = DEFAULT_LIMIT,
  } = req.query;

  const params = {
    genres,
    category,
    q,
    p: parseInt(p, 10),
    limit: limit < MAX_LIMIT ? parseInt(limit, 10) : MAX_LIMIT,
  };

  query(queryMovies, params).then(({ movies, total, pages }) => {
    if (pages.next || pages.previous) {
      res.links(getLinks(req, pages));
    }
    res.json({ movies, total });
  }).catch(handleError(res));
}

export function get({ params: { id } }, res) {
  query(getMovie, id).then(movie => {
    res.json(movie);
  }).catch(handleError(res, id));
}

export function post({ body }, res) {
  const { error, value: movie } = validate(body, schema, {
    abortEarly: false,
  });

  if (error) {
    return res.status(422).json({
      errors: getValidationErrors(error),
    });
  }

  const now = (new Date()).toISOString();

  update(createMovie, movie, now).then(created => {
    res.location(`/api/movies/${created.id}`).status(201).json(created);
  }).catch(handleError(res));
}

export function put({ params: { id }, body }, res) {
  const picked = pick(schema, Object.keys(body));
  const { error, value: fields } = validate(body, picked, {
    abortEarly: false,
  });

  if (error) {
    return res.status(422).json({
      errors: getValidationErrors(error),
    });
  }

  const now = (new Date()).toISOString();

  update(updateMovie, id, fields, now).then(updated => {
    res.json(updated);
  }).catch(handleError(res, id));
}

export function del({ params: { id } }, res) {
  update(deleteMovie, id).then(() => {
    res.status(204).json();
  }).catch(handleError(res, id));
}
