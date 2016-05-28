import { genres } from '../models/movie.schema';

export function get(_, res) {
  res.json(genres);
}
