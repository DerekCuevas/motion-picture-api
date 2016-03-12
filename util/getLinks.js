import qs from 'qs';

export default function getLinks(req, { next, previous }) {
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
