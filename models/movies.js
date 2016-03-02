import fs from 'fs';
import path from 'path';
import shortid from 'shortid';
import strict from '../util/strict';
import contains from '../util/contains';

const MOVIES_FILE = path.join(__dirname, '../../resources/movies.json');

export function getMovie(movies, id = '') {
    return movies.find(movie => movie.id === id);
}

export function createMovie(movies, movie = {}) {
    const newMovie = {
        ...movie,
        id: shortid.generate(),
    };

    return {
        movie: newMovie,
        movies: [...movies, newMovie],
    };
}

export function updateMovie(movies, id = '', fields = {}) {
    const found = getMovie(movies, id);

    if (!found) {
        return undefined;
    }

    const updated = {
        ...found,
        ...fields,
        id,
    };

    const removed = movies.filter(movie => movie.id !== id);

    return {
        movie: updated,
        movies: [...removed, updated],
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

function filter(movies = [], genres = [], category = '', text = '') {
    return movies.filter(movie => {
        if (genres.length === 0) {
            return true;
        }

        return contains(genres, movie.genre.toLowerCase());
    }).filter(movie => {
        if (!text) {
            return true;
        }

        if (category) {
            return strict(movie[category], text);
        }

        const matches = Object.keys(movie).map(key => strict(movie[key], text));
        return matches.some(match => match !== false);
    });
}

function pageinate(length, size, page) {
    const offset = (page - 1) * size;
    const pages = {size};

    if (offset + size < length) {
        pages.next = {
            page: page + 1,
        };
    }

    if (offset > 0) {
        pages.prev = {
            page: page - 1,
        };
    }

    return pages;
}

export function queryMovies(movies, page, size, genres, category, text) {
    const results = filter(movies, genres, category, text);
    const length = results.length;
    const offset = (page - 1) * size;

    const start = offset <= length ? offset : length - size;

    return {
        pages: pageinate(length, size, start),
        movies: results.slice(start, start + size),
        total: length,
    };
}

export function query(queryfn, ...args) {
    return new Promise((resolve, reject) => {
        fs.readFile(MOVIES_FILE, (error, data) => {
            if (error) {
                return reject(error);
            }
            resolve(queryfn(JSON.parse(data), ...args));
        });
    });
}

export function update(updatefn, ...args) {
    return new Promise((resolve, reject) => {
        fs.readFile(MOVIES_FILE, (error, data) => {
            if (error) {
                return reject(error);
            }

            const result = updatefn(JSON.parse(data), ...args);

            if (!result) {
                return reject();
            }

            const {movie, movies} = result;

            fs.writeFile(MOVIES_FILE, JSON.stringify(movies, null, 2), err => {
                if (err) {
                    return reject(err);
                }
                resolve(movie);
            });
        });
    });
}
