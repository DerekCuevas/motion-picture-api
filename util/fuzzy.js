import _ from 'lodash';

// adapted from here:
// http://codereview.stackexchange.com/questions/23899/faster-javascript-fuzzy-string-matching-function
// added ability to search on multiple keywords in the same string

const cache = _.memoize((str) => {
    return new RegExp('^' + str.replace(/./g, (x) => {
        return /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/.test(x) ? '\\' + x + '?' : x + '?';
    }) + '$');
});

export default function fuzzy(str, pattern) {
    const keywords = pattern.split(' ');

    if (!str || !pattern) {
        return false;
    }
    return _.some(keywords, (word) => {
        return cache(str.toLowerCase()).test(word.toLowerCase());
    });
}
