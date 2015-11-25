import fs from 'fs';
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

// FIXME: make this absolute w/ __dirname?
const MOVIE_FILE = './resources/movies.json';

// hide or expose mori?
export default class Movies {
    constructor() {
        this.movies = toClj(JSON.parse(fs.readFileSync(MOVIE_FILE)));
    }

    save(cb) {
        fs.writeFile(MOVIE_FILE, JSON.stringify(toJs(this.movies)), cb);
    }

    // it might be better to index movies by sku
    getMovie(sku = '') {
        return first(filter((movie) => {
            return get(movie, 'sku') === sku;
        }, this.movies));
    }

    createMovie(movie = hashMap()) {
        const newMovie = assoc(movie, 'sku', shortid.generate());
        this.movies = conj(this.movies, newMovie);
        return newMovie;
    }

    updateMovie(sku = '', fields = hashMap()) {
        const movie = this.getMovie(sku);

        if (!movie) {
            return undefined;
        }

        const updated = merge(movie, dissoc(fields, 'sku'));
        const removed = remove(partial(equals, movie), this.movies);

        this.movies = conj(removed, updated);
        return updated;
    }

    deleteMovie(sku = '') {
        const movie = this.getMovie(sku);

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
