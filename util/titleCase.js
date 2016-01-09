export default function titleCase(title) {
    return title.replace(/\w\S*/g, str => {
        return str.charAt(0).toUpperCase() + str.substr(1);
    });
}
