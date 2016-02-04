import fs from 'fs';
import path from 'path';
import shortid from 'shortid';
import {
    toClj, toJs, hashMap, assoc,
    conj, first, subvec, dissoc,
    filter, get, merge, remove,
    partial, equals, count, into,
    vector, vals, map, some,
} from 'mori';

import contains from '../util/contains';
import strict from '../util/strict';

const MOVIES_FILE = path.join(__dirname, '../../resources/movies.json');

export default class Movies {
    constructor() {
        // this wouldn't scale well, but works fine for this app
        this.movies = toClj(JSON.parse(fs.readFileSync(MOVIES_FILE)));
    }

    save(cb) {
        fs.writeFile(MOVIES_FILE, JSON.stringify(toJs(this.movies), null, 4), cb);
    }

    // TODO: maybe add this, something like it?
    load(cb) {
        JSON.parse(fs.readFile(MOVIES_FILE, cb));
    }

    getMovie(id = '') {
        const movie = first(filter(m => {
            return get(m, 'id') === id;
        }, this.movies));

        return toJs(movie);
    }

    createMovie(movie = {}) {
        const newMovie = assoc(toClj(movie), 'id', shortid.generate());
        this.movies = conj(this.movies, newMovie);
        return toJs(newMovie);
    }

    updateMovie(id = '', fields = {}) {
        const movie = toClj(this.getMovie(id));

        if (!movie) {
            return undefined;
        }

        const updated = merge(movie, dissoc(toClj(fields), 'id'));
        const removed = remove(partial(equals, movie), this.movies);

        this.movies = conj(removed, updated);
        return toJs(updated);
    }

    deleteMovie(id = '') {
        const movie = toClj(this.getMovie(id));

        if (!movie) {
            return undefined;
        }

        this.movies = remove(partial(equals, movie), this.movies);
        return toJs(movie);
    }

    filter(genres = [], category = '', text = '') {
        return toJs(filter(movie => {
            if (!text.length) {
                return true;
            }

            if (category) {
                return strict(get(movie, category), text);
            }

            const matches = map(val => strict(val, text), vals(movie));
            return some(match => match !== false, matches);
        }, filter(movie => {
            const selectedGenres = toClj(genres);
            const movieGenre = toJs(get(movie, 'genre')).toLowerCase();

            if (!count(selectedGenres)) {
                return true;
            }

            return contains(selectedGenres, movieGenre);
        }, this.movies)));
    }

    pageinate(vec, limit, offset) {
        const more = offset + limit < count(vec);
        const less = offset > 0;
        let pages = hashMap('limit', limit);

        if (more) {
            pages = assoc(pages, 'next', hashMap('offset', offset + limit));
        }

        if (less) {
            pages = assoc(pages, 'prev', hashMap('offset', offset - limit));
        }

        // returns a mori hashMap
        return pages;
    }

    queryMovies(limit, offset, genres, category, text) {
        const results = into(vector(), this.filter(genres, category, text));
        const length = count(results);

        let start = (offset < length) ? offset : length - 1;
        const end = (limit + offset < length) ? limit + offset : length;

        start = (start === -1) ? 0 : start;

        const sliced = subvec(results, start, end);
        const pages = this.pageinate(results, limit, start);

        return toJs(hashMap('movies', sliced, 'pages', pages, 'total', length));
    }
}
