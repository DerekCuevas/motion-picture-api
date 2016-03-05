import memoize from 'lodash.memoize';

function search(str, pattern) {
    if (!str || !pattern) {
        return false;
    }

    return str.toString().toLowerCase().includes(pattern.toLowerCase());
}

export default memoize(search, (...args) => JSON.stringify(args));
