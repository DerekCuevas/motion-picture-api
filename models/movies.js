import fs from 'fs';
import shortid from 'shortid';
import { MOVIES_FILE, DEFAULT_LIMIT, FIRST_PAGE } from '../config';
import search from '../util/search';
import contains from '../util/contains';

export function getMovie(movies, id = '') {
  return movies.find(movie => movie.id === id);
}

export function createMovie(movies, movie = {}, when) {
  const created = {
    ...movie,
    id: shortid.generate(),
    created_at: when,
    updated_at: when,
  };

  return {
    movie: created,
    movies: [created, ...movies],
  };
}

export function updateMovie(movies, id = '', fields = {}, when) {
  const found = getMovie(movies, id);

  if (!found) {
    return undefined;
  }

  const updated = {
    ...found,
    ...fields,
    id,
    updated_at: when,
  };

  const removed = movies.filter(movie => movie.id !== id);

  return {
    movie: updated,
    movies: [updated, ...removed],
  };
}

export function deleteMovie(movies, id = '') {
  const found = getMovie(movies, id);

  if (!found) {
    return undefined;
  }

  return {
    movie: found,
    movies: movies.filter(movie => movie.id !== id),
  };
}

function filter(movies, genres = [], category = '', q = '') {
  return movies.filter(movie => {
    if (genres.length === 0) {
      return true;
    }

    return contains(genres, movie.genre.toLowerCase());
  }).filter(movie => {
    if (!q) {
      return true;
    }

    if (category) {
      return search(movie[category], q);
    }

    const matches = Object.keys(movie).map(key => search(movie[key], q));
    return matches.some(match => match !== false);
  });
}

function pageinate(length = 0, params = {}) {
  const { p: page, limit } = params;
  const offset = (page - 1) * limit;
  const total = Math.ceil(length / limit);
  const pages = {};

  if (offset + limit < length) {
    pages.next = {
      ...params,
      p: page + 1,
    };
  }

  if (offset > 0) {
    pages.previous = {
      ...params,
      p: (page - 1) > total ? total : page - 1,
    };
  }

  return pages;
}

export function queryMovies(movies, params = {}) {
  const {
    category,
    q,
    p = FIRST_PAGE,
    limit = DEFAULT_LIMIT,
    genres = [],
  } = params;

  const results = filter(
    movies,
    genres.map(genre => genre.trim().toLowerCase()),
    category ? category.trim().toLowerCase() : '',
    q ? q.trim().toLowerCase() : ''
  );

  const offset = (p - 1) * limit;

  return {
    pages: pageinate(results.length, { p, limit, genres, category, q }),
    movies: results.slice(offset, offset + limit),
    total: results.length,
  };
}

export function query(queryfn, ...args) {
  return new Promise((resolve, reject) => {
    fs.readFile(MOVIES_FILE, (error, data) => {
      if (error) {
        return reject({ status: 500, error });
      }

      const result = queryfn(JSON.parse(data), ...args);

      if (!result) {
        return reject({ status: 404 });
      }

      resolve(result);
    });
  });
}

export function update(updatefn, ...args) {
  return new Promise((resolve, reject) => {
    fs.readFile(MOVIES_FILE, (error, data) => {
      if (error) {
        return reject({ status: 500, error });
      }

      const result = updatefn(JSON.parse(data), ...args);

      if (!result) {
        return reject({ status: 404 });
      }

      const { movie, movies } = result;

      fs.writeFile(MOVIES_FILE, JSON.stringify(movies, null, 2), err => {
        if (err) {
          return reject({ status: 500, err });
        }

        resolve(movie);
      });
    });
  });
}
