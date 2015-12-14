import {some} from 'lodash';

export default function strict(str, pattern) {
    const keywords = pattern.split(' ');

    if (!str || !pattern) {
        return false;
    }

    return some(keywords, word => {
        return str.toString().toLowerCase().search(word.toLowerCase()) !== -1;
    });
}
