import expect from 'expect';
import shortid from 'shortid';
import {
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  queryMovies,
} from '../../models/movies';

const movies = [
  { id: 'Nk1AP24Gl', title: '2001: A Space Odessy', genre: 'Sci-Fi' },
  { id: 'NJSJOnNGx', title: 'Planet of the Apes', genre: 'Sci-Fi' },
  { id: 'Vy0yun4Gg', title: 'Dr. Strangelove', genre: 'Comedy' },
];

describe('Movies Model', () => {
  describe('#getMovie()', () => {
    it('Should return movie indexed by id.', () => {
      const movie = {
        id: 'Nk1AP24Gl',
        title: '2001: A Space Odessy',
        genre: 'Sci-Fi',
      };

      expect(getMovie(movies, 'Nk1AP24Gl')).toEqual(movie);
    });

    it('Should return undefined if not found.', () => {
      expect(getMovie(movies, 'abc123')).toNotExist();
      expect(getMovie(movies)).toNotExist();
    });
  });

  describe('#createMovie()', () => {
    it('Should add a movie to the movies.', () => {
      const result = createMovie(movies, {
        title: 'Pulp Fiction',
        genre: 'Horror',
      });

      expect(result).toExist();
      expect(result.movies).toInclude(result.movie);

      expect(result.movies).toNotEqual(movies);
      expect(movies.length + 1).toEqual(result.movies.length);
    });

    it('Should add movie to the front of the movie list.', () => {
      const result = createMovie(movies, {
        title: 'Pulp Fiction',
        genre: 'Horror',
      });

      expect(result.movies[0]).toEqual(result.movie);
    });

    it('Should genreate a random id between lengths 7 <-> 14.', () => {
      const result = createMovie(movies, {
        title: 'Harry Potter',
        genre: 'Fantasy',
      });

      expect(result.movie.id).toExist().toBeAn('string');
      expect(result.movie.id.length).toBeGreaterThan(6).toBeLessThan(15);

      expect(shortid.isValid(result.movie.id)).toEqual(true);
    });

    it('Should overwrite id with randomly genreated id if one is supplied.', () => {
      const id = 'AbC123';
      const result = createMovie(movies, { id });

      expect(result.movie.id).toExist().toBeAn('string').toNotEqual(id);
      expect(result.movie.id.length).toBeGreaterThan(6).toBeLessThan(15);

      expect(shortid.isValid(result.movie.id)).toEqual(true);
    });
  });

  describe('#updateMovie()', () => {
    it('Should update movie by id.', () => {
      const now = (new Date()).toISOString();

      const result = updateMovie(movies, 'Vy0yun4Gg', {
        genre: 'Horror',
      }, now);

      expect(result.movie).toExist().toEqual({
        id: 'Vy0yun4Gg',
        genre: 'Horror',
        title: 'Dr. Strangelove',
        updated_at: now,
      });
      expect(result.movies).toInclude(result.movie);
    });

    it('Should return undefined if not found.', () => {
      const result = updateMovie(movies, 'not-a-real-id', {
        genre: 'Horror',
      });

      expect(result).toNotExist();
    });

    it('Should add the updated movie to the front of the movie list.', () => {
      const now = (new Date()).toISOString();
      const result = updateMovie(movies, 'Vy0yun4Gg', {
        genre: 'Horror',
      }, now);

      expect(result.movies[0]).toEqual(result.movie);
    });

    it('Should not update the id.', () => {
      const result = updateMovie(movies, 'Vy0yun4Gg', {
        id: 'abc123',
      });

      expect(result.movie.id).toExist();
      expect(result.movie.id).toEqual('Vy0yun4Gg');
    });

    it('Should not make duplicate copies of the movie.', () => {
      const id = 'Vy0yun4Gg';
      const result = updateMovie(movies, 'Vy0yun4Gg', {
        genre: 'Horror',
      });

      const ids = result.movies.map(movie => movie.id);
      const updated = ids.filter(i => i === id);

      expect(updated[0]).toEqual(id);
      expect(updated.length).toEqual(1);
    });
  });

  describe('#deleteMovie()', () => {
    it('Should return undefined if not found.', () => {
      expect(deleteMovie(movies)).toNotExist();
      expect(deleteMovie(movies, '')).toNotExist();
      expect(deleteMovie(movies, 'not-a-real-id')).toNotExist();
    });

    it('Should remove movie by id.', () => {
      const movie = {
        id: 'Nk1AP24Gl',
        title: '2001: A Space Odessy',
        genre: 'Sci-Fi',
      };

      const result = deleteMovie(movies, 'Nk1AP24Gl');

      expect(result.movie).toExist().toEqual(movie);
      expect(result.movies).toExclude(result.movie);
      expect(movies).toNotEqual(result.movies);
      expect(movies.length - 1).toEqual(result.movies.length);
    });
  });

  describe('#queryMovies()', () => {
    it('Should return all movies.', () => {
      const result = queryMovies(movies, { limit: movies.length });

      expect(result.movies).toEqual(movies);
    });

    it('Should return the correct keys.', () => {
      const results = queryMovies(movies, { limit: 3 });
      const props = Object.keys(results);

      expect(props).toInclude('movies');
      expect(props).toInclude('total');
      expect(props).toInclude('pages');
    });

    describe('#filter()', () => {
      it('Should return all movies.', () => {
        expect(queryMovies(movies, { genres: [] }).movies).toEqual(movies);
        expect(queryMovies(movies, {
          genres: [],
          category: '',
          text: '',
        }).movies).toEqual(movies);
      });

      it('Should filter movies by genre.', () => {
        expect(queryMovies(movies, {
          genres: ['comedy', 'sci-fi'],
        }).movies).toEqual(movies);

        expect(queryMovies(movies, {
          genres: ['comedy', 'sci-fi', 'action'],
        }).movies).toEqual(movies);

        expect(queryMovies(movies, {
          genres: ['comedy'],
        }).movies).toEqual([
          { id: 'Vy0yun4Gg', title: 'Dr. Strangelove', genre: 'Comedy' },
        ]);

        expect(queryMovies(movies, {
          genres: ['sci-fi'],
        }).movies).toEqual([
          { id: 'Nk1AP24Gl', title: '2001: A Space Odessy', genre: 'Sci-Fi' },
          { id: 'NJSJOnNGx', title: 'Planet of the Apes', genre: 'Sci-Fi' },
        ]);
      });

      it('Should fuzzy search text by category.', () => {
        expect(queryMovies(movies, {
          category: 'id',
          q: 'love',
        }).movies).toEqual([]);

        expect(queryMovies(movies, {
          category: 'title',
          q: 'love',
        }).movies).toEqual([
          { id: 'Vy0yun4Gg', title: 'Dr. Strangelove', genre: 'Comedy' },
        ]);

        expect(queryMovies(movies, {
          genres: ['comedy'],
          category: 'title',
          q: 'love',
        }).movies).toEqual([
          { id: 'Vy0yun4Gg', title: 'Dr. Strangelove', genre: 'Comedy' },
        ]);

        expect(queryMovies(movies, {
          genres: [],
          category: 'genre',
          q: 'sci',
        }).movies).toEqual([
          { id: 'Nk1AP24Gl', title: '2001: A Space Odessy', genre: 'Sci-Fi' },
          { id: 'NJSJOnNGx', title: 'Planet of the Apes', genre: 'Sci-Fi' },
        ]);
      });

      it('Should fuzzy search text by all categories.', () => {
        expect(queryMovies(movies, {
          q: 'love',
        }).movies).toEqual([
          { id: 'Vy0yun4Gg', title: 'Dr. Strangelove', genre: 'Comedy' },
        ]);

        expect(queryMovies(movies, {
          genres: ['sci-fi'],
          q: 'love',
        }).movies).toEqual([]);

        expect(queryMovies(movies, {
          q: 'apes',
        }).movies).toEqual([
          { id: 'NJSJOnNGx', title: 'Planet of the Apes', genre: 'Sci-Fi' },
        ]);

        expect(queryMovies(movies, {
          genres: ['sci-fi'],
          q: 'ape',
        }).movies).toEqual([
          { id: 'NJSJOnNGx', title: 'Planet of the Apes', genre: 'Sci-Fi' },
        ]);
      });

      it('Should be whitespace and case insensitive.', () => {
        expect(queryMovies(movies, {
          q: 'Love',
        }).movies).toEqual([
          { id: 'Vy0yun4Gg', title: 'Dr. Strangelove', genre: 'Comedy' },
        ]);

        expect(queryMovies(movies, {
          q: '  APES    ',
        }).movies).toEqual([
          { id: 'NJSJOnNGx', title: 'Planet of the Apes', genre: 'Sci-Fi' },
        ]);

        expect(queryMovies(movies, {
          genres: ['  SCI-FI'],
          q: '   ape    ',
        }).movies).toEqual([
          { id: 'NJSJOnNGx', title: 'Planet of the Apes', genre: 'Sci-Fi' },
        ]);

        expect(queryMovies(movies, {
          genres: ['comeDY ', 'Sci-fi'],
        }).movies).toEqual([
          { genre: 'Sci-Fi', id: 'Nk1AP24Gl', title: '2001: A Space Odessy' },
          { genre: 'Sci-Fi', id: 'NJSJOnNGx', title: 'Planet of the Apes' },
          { genre: 'Comedy', id: 'Vy0yun4Gg', title: 'Dr. Strangelove' },
        ]);

        expect(queryMovies(movies, {
          genres: [],
          category: ' Genre',
          q: 'sci   ',
        }).movies).toEqual([
          { id: 'Nk1AP24Gl', title: '2001: A Space Odessy', genre: 'Sci-Fi' },
          { id: 'NJSJOnNGx', title: 'Planet of the Apes', genre: 'Sci-Fi' },
        ]);
      });
    });

    describe('#pagination()', () => {
      const list = [];
      for (let i = 1; i <= 20; i += 1) {
        list.push({ id: i });
      }

      const limit = 3;
      const total = Math.ceil(list.length / limit);

      it('Should return the correct number of results.', () => {
        const results = queryMovies(list, { limit });

        expect(results.total).toEqual(list.length);
        expect(results.movies.length).toBeLessThanOrEqualTo(limit);

        expect(results.pages.next.p).toEqual(2);
        expect(results.pages.previous).toNotExist();
      });

      it('Should paginate results.', () => {
        let progress = [];

        for (let i = 1; i <= total; i += 1) {
          const results = queryMovies(list, { limit, p: i });

          progress = progress.concat(results.movies);

          const offset = (i - 1) * limit;
          const slice = list.slice(offset, offset + limit);

          expect(results.total).toEqual(list.length);
          expect(results.movies).toExist();
          expect(results.movies.length).toBeLessThanOrEqualTo(limit);

          expect(results.movies).toEqual(slice);

          if (i < total) {
            expect(results.pages.next.p).toEqual(i + 1);
          } else {
            expect(results.pages.previous.p).toEqual(i - 1);
          }

          if (i === 1) {
            expect(results.pages.previous).toNotExist();
          } else if (i === total) {
            expect(results.pages.next).toNotExist();
          }
        }

        expect(progress).toEqual(list);
      });

      it('Should preserve query params across pages.', () => {
        const params = {
          p: 1,
          limit: 3,
          q: '1',
          category: undefined,
          genres: [],
        };

        const results = queryMovies(list, params);

        expect(results.pages).toExist();
        expect(results.pages.next).toEqual({
          ...params,
          p: 2,
        });
      });

      it('Should set previous page as last if page > total pages.', () => {
        const results = queryMovies(list, {
          limit,
          p: total + 5,
        });

        expect(results.movies.length).toEqual(0);
        expect(results.pages.previous.p).toEqual(total);

        const last = queryMovies(list, {
          limit,
          p: total,
        });

        expect(last.movies.length).toBeGreaterThan(0);
        expect(last.pages.next).toNotExist();
      });
    });
  });
});
