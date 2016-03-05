import fs from 'fs';
import shortid from 'shortid';
import {MOVIES_FILE, DEFAULT_PAGE_SIZE, FIRST_PAGE} from '../config';
import search from '../util/search';
import contains from '../util/contains';

export function getMovie(movies, id = '') {
    return movies.find(movie => movie.id === id);
}

export function createMovie(movies, movie = {}, when) {
    const newMovie = {
        ...movie,
        id: shortid.generate(),
        created_at: when,
        updated_at: when,
    };

    return {
        movie: newMovie,
        movies: [...movies, newMovie],
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
            return search(movie[category], text);
        }

        const matches = Object.keys(movie).map(key => search(movie[key], text));
        return matches.some(match => match !== false);
    });
}

// TODO: previous should point to last page if page > total pages
function pageinate(length = 0, params = {}) {
    const {page, size} = params;
    const offset = (page - 1) * size;
    const pages = {};

    if (offset + size < length) {
        pages.next = {
            ...params,
            page: page + 1,
        };
    }

    if (offset > 0) {
        pages.previous = {
            ...params,
            page: page - 1,
        };
    }

    return pages;
}

export function queryMovies(movies, {page = FIRST_PAGE, size = DEFAULT_PAGE_SIZE, genres = [], category, text} = {}) {
    const offset = (page - 1) * size;

    const results = filter(
        movies,
        genres ? genres.map(genre => genre.trim().toLowerCase()) : [],
        category ? category.trim().toLowerCase() : '',
        text ? text.trim().toLowerCase() : ''
    );

    // TODO: add tests for this
    const start = offset <= results.length ? offset : results.length - size;

    return {
        pages: pageinate(results.length, {page, size, genres, category, text}),
        movies: results.slice(start, start + size),
        total: results.length,
    };
}

export function query(queryfn, ...args) {
    return new Promise((resolve, reject) => {
        fs.readFile(MOVIES_FILE, (error, data) => {
            if (error) {
                return reject({status: 500, error});
            }

            const result = queryfn(JSON.parse(data), ...args);

            if (!result) {
                return reject({status: 404});
            }

            resolve(result);
        });
    });
}

export function update(updatefn, ...args) {
    return new Promise((resolve, reject) => {
        fs.readFile(MOVIES_FILE, (error, data) => {
            if (error) {
                return reject({status: 500, error});
            }

            const result = updatefn(JSON.parse(data), ...args);

            if (!result) {
                return reject({status: 404});
            }

            const {movie, movies} = result;

            fs.writeFile(MOVIES_FILE, JSON.stringify(movies, null, 2), err => {
                if (err) {
                    return reject({status: 500, err});
                }
                resolve(movie);
            });
        });
    });
}
