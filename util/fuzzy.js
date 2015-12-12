import {memoize} from 'lodash';

// adapted from here:
// http://codereview.stackexchange.com/questions/23899/faster-javascript-fuzzy-string-matching-function

const cache = memoize(pattern => {
    return new RegExp(pattern.split('').reduce((a, b) => {
        return a + '[^' + b + ']*' + b;
    }));
});

export default function fuzzy(str, pattern) {
    if (!str || !pattern) {
        return false;
    }
    return cache(pattern.toLowerCase()).test(str.toString().toLowerCase());
}
