export default function strict(str, pattern) {
    if (!str || !pattern) {
        return false;
    }

    return str.toString().toLowerCase().includes(pattern.toLowerCase());
}
