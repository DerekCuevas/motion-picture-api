export default function strict(str, pattern) {
    if (!str || !pattern) {
        return false;
    }

    // FIXME: '\' throws

    // FIXME: use .includes here
    return str.toString().toLowerCase().search(pattern.toLowerCase()) !== -1;
}
