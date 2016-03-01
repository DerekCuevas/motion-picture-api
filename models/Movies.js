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

// TODO: add func to search Object
function filter(movies, genres = [], category = '', text = '') {
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

function pageinate(movies, limit, offset) {
    const more = offset + limit < movies.length;
    const less = offset > 0;
    const pages = {limit};

    if (more) {
        pages.next = {
            offset: offset + limit,
        };
    }

    if (less) {
        pages.prev = {
            offset: offset - limit,
        };
    }

    return pages;
}

// TODO: change to page
export function queryMovies(movies, limit, offset, genres, category, text) {
    const results = filter(genres, category, text);
    const length = results.length;

    let start = (offset < length) ? offset : length - 1;
    const end = (limit + offset < length) ? limit + offset : length;

    start = (start === -1) ? 0 : start;

    const sliced = results.slice(start, end);
    const pages = pageinate(results, limit, start);

    return {
        pages,
        movies: sliced,
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
