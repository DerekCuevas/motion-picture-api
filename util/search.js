import isObject from 'lodash.isobject';

function forEvery(obj, fn) {
    Object.keys(obj).forEach(key => fn(key, obj[key]));
}

export default function search(obj, keyword) {
    let match = false;

    (function deep(ob, kw) {
        forEvery(ob, (_, val) => {
            if (isObject(val)) {
                deep(val, kw);
            } else if (val.toString().toLowerCase().includes(kw.toLowerCase())) {
                match = true;
            }
        });
    }(obj, keyword));

    return match;
}
