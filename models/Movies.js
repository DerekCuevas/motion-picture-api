import fs from 'fs';
import path from 'path';
import shortid from 'shortid';

import strict from '../util/strict';
import contains from '../util/contains';

const MOVIES_FILE = path.join(__dirname, '../../resources/movies.json');

export default class Movies {
    constructor() {
        // this wouldn't scale well, but works fine for this app
        this.movies = JSON.parse(fs.readFileSync(MOVIES_FILE));
    }

    save(cb) {
        fs.writeFile(MOVIES_FILE, JSON.stringify(this.movies, null, 4), cb);
    }

    // TODO: maybe add this, something like it?
    load(cb) {
        fs.readFile(MOVIES_FILE, cb);
    }

    getMovie(id = '') {
        return this.movies.find(movie => movie.id === id);
    }

    createMovie(movie = {}) {
        const newMovie = Object.assign({}, movie, {
            id: shortid.generate(),
        });

        this.movies = [...this.movies, newMovie];
        return newMovie;
    }

    updateMovie(id = '', fields = {}) {
        const found = this.getMovie(id);

        if (!found) {
            return undefined;
        }

        const updated = Object.assign({}, found, Object.assign({}, fields, {id}));
        const removed = this.movies.filter(movie => movie.id !== id);

        this.movies = [...removed, updated];
        return updated;
    }

    deleteMovie(id = '') {
        const found = this.getMovie(id);

        if (!found) {
            return undefined;
        }

        this.movies = this.movies.filter(movie => movie.id !== id);
        return found;
    }

    filter(genres = [], category = '', text = '') {
        return this.movies.filter(movie => {
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

    pageinate(arr, limit, offset) {
        const more = offset + limit < arr.length;
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

    queryMovies(limit, offset, genres, category, text) {
        const results = this.filter(genres, category, text);
        const length = results.length;

        let start = (offset < length) ? offset : length - 1;
        const end = (limit + offset < length) ? limit + offset : length;

        start = (start === -1) ? 0 : start;

        const sliced = results.slice(start, end);
        const pages = this.pageinate(results, limit, start);

        return {
            pages,
            movies: sliced,
            total: length,
        };
    }
}
