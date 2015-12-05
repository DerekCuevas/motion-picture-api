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
import fuzzy from '../util/fuzzy';

const MOVIES_FILE = path.join(__dirname, '../../resources/movies.json');

// FIXME: hide or expose mori?
export default class Movies {
    constructor() {
        this.movies = toClj(JSON.parse(fs.readFileSync(MOVIES_FILE)));
    }

    save(cb) {
        fs.writeFile(MOVIES_FILE, JSON.stringify(toJs(this.movies), null, 4), cb);
    }

    // it might be better to index movies by id
    getMovie(id = '') {
        return first(filter((movie) => {
            return get(movie, 'id') === id;
        }, this.movies));
    }

    createMovie(movie = hashMap()) {
        const newMovie = assoc(movie, 'id', shortid.generate());
        this.movies = conj(this.movies, newMovie);
        return newMovie;
    }

    updateMovie(id = '', fields = hashMap()) {
        const movie = this.getMovie(id);

        if (!movie) {
            return undefined;
        }

        const updated = merge(movie, dissoc(fields, 'id'));
        const removed = remove(partial(equals, movie), this.movies);

        this.movies = conj(removed, updated);
        return updated;
    }

    deleteMovie(id = '') {
        const movie = this.getMovie(id);

        if (!movie) {
            return undefined;
        }

        this.movies = remove(partial(equals, movie), this.movies);
        return movie;
    }

    filter(genres = vector(), category = '', text = '') {
        // filtering movies by fuzzy text matches
        return filter((movie) => {
            if (!text.length) {
                return true;
            }

            if (category) {
                return fuzzy(get(movie, category), text);
            }

            const matches = map(val => fuzzy(val, text), vals(movie));
            return some(match => match !== false, matches);

        // filtering movies by genres
        }, filter((movie) => {
            if (!count(genres)) {
                return true;
            }

            return contains(genres, get(movie, 'genre'));
        }, this.movies));
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

        return pages;
    }

    queryMovies(limit, offset, genres, category, text) {
        const results = into(vector(), this.filter(genres, category, text));
        const length = count(results);

        const start = offset < length ? offset : length;
        const end = limit + offset < length ? limit + offset : length;

        const sliced = subvec(results, start, end);
        const pages = this.pageinate(results, limit, start);

        return hashMap('movies', sliced, 'pages', pages, 'total', length);
    }
}
