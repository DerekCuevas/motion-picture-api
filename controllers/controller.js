import qs from 'qs';
import {getMovie, queryMovies, query} from '../models/movies';

function getLinks(req, {next, previous}) {
    const base = `${req.protocol}://${req.get('host')}`;
    const links = {};

    if (next) {
        links.next = `${base}/api/movies?${qs.stringify(next)}`;
    }

    if (previous) {
        links.previous = `${base}/api/movies?${qs.stringify(previous)}`;
    }

    return links;
}

export function index(req, res) {
    const {page = 1, size = 10, genres = [], category, text} = req.query;

    query(queryMovies, {
        page: parseInt(page, 10),
        size: parseInt(size, 10),
        genres: genres.map(genre => genre.trim().toLowerCase()),
        category: category ? category.trim().toLowerCase() : undefined,
        text: text ? text.trim().toLowerCase() : undefined,
    }).then(({movies, total, pages}) => {
        if (pages.next || pages.previous) {
            res.links(getLinks(req, pages));
        }

        res.json({movies, total});
    });
}

export function get({params: {id}}, res) {
    query(getMovie, id).then(movie => {
        res.json(movie);
    }).catch(({status}) => {
        if (status === 404) {
            res.status(404).json({
                message: `The movie by id: "${id}" does not exist`,
            });
        }
    });
}
