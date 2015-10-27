var fs = require('fs');
var _ = require('lodash');

function Movies() {
    this._movies = JSON.parse(fs.readFileSync('resources/movies.json'));
}

Movies.prototype._isFuzzy = (function () {
    var cache = _.memoize(function (str) {
        return new RegExp('^' + str.replace(/./g, function (x) {
            return /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/.test(x) ? '\\' + x + '?' : x + '?';
        }) + '$');
    });

    return function (str, pattern) {
        if (!str || !pattern) {
            return false;
        }
        return cache(str.toLowerCase()).test(pattern.toLowerCase());
    };
}());

Movies.prototype._normalize = function (query) {
    var normalized = _.cloneDeep(query);

    normalized.filters.genres = _.map(query.filters.genres, function (genre) {
        return genre.toLowerCase();
    });

    normalized.filters.search.category = query.filters.search.category.toLowerCase();
    normalized.filters.search.text = query.filters.search.text.toLowerCase();

    return normalized;
};

Movies.prototype._filterMovies = function (query) {
    var genres = query.filters.genres;
    var search = query.filters.search;

    // TODO: might be better to compose some functions here 
    return _.filter(this._movies, function (movie) {
        var allGenres = genres.length === 0;
        var inGenres = _.contains(genres, movie.genre.toLowerCase());

        if (inGenres || allGenres) {
            if (!search.category && !search.text) {
                return true;
            }
            if (search.category) {
                return this._isFuzzy(movie[search.category], search.text);
            }
            return _.some(_.values(movie), function (val) {
                return this._isFuzzy(val, search.text);
            });
        }

        return false;
    }.bind(this));
};

Movies.prototype._getPages = function (movies, query) {
    var more = query.offset + query.limit < movies.length;
    var less = query.offset !== 0;
    var pages = {};

    if (more) {
        pages.next = _.cloneDeep(query);
        pages.next.offset = query.offset + query.limit;
    }

    if (less) {
        pages.prev = _.cloneDeep(query);
        pages.prev.offset = query.offset - query.limit;
    }

    return pages;
};

Movies.prototype.total = function () {
    return this._movies.length;
};

Movies.prototype.search = function (query) {
    query = this._normalize(query);
    var filtered = this._filterMovies(query);

    return {
        movies: filtered.slice(query.offset, query.offset + query.limit),
        pages: this._getPages(filtered, query),
        total: this.total()
    };
};

Movies.prototype.exists = function (sku) {
    return _.find(this._movies, function (movie) {
        return movie.sku === sku;
    }) !== undefined;
};

Movies.prototype.getMovie = function (sku) {
    return _.find(this._movies, function (movie) {
        return movie.sku === sku;
    });
};

module.exports = Movies;
