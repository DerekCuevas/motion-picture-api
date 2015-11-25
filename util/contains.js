import {count, filter, partial, equals} from 'mori';

export default function contains(seq, item) {
    return count(filter(partial(equals, item), seq)) !== 0;
}
