# Motion Picture API
A small, stateless, mock HTTP JSON API build with Node.js and Express.

## To Run
First `npm install`, Then:

For production:
```sh
npm start
```

For development:
```sh
npm run dev
```

To run the tests:
```sh
npm test
```

More: see the npm [scripts](package.json#L6).

## Docs
Using [httpie](https://github.com/jkbrzt/httpie) to show examples.

### Status Codes Used

- 200 - OK
- 201 - Created
- 204 - No Content
- 304 - Not Modified
- 404 - Not Found
- 422 - Unprocessable Entity
- 500 & Up - Internal Server Error

### Routes:

**GET - /api/movies**

Returns a paginated set of results filtered by specified query parameters. Will return `200` on success. Uses the HTTP `link` header for pagination.

Optional query params - `limit`, `p` (page number), `genres` (array format), `category`, `q` (query string)

Example:
```sh
http ":3000/api/movies?q=star+wars&genres[0]=sci-fi+and+fantasy"
```

**GET - /api/movies/genres**

Returns array of allowed genres. Will return `200` on success.

Example:
```sh
http :3000/api/movies/genres
```

**GET - /api/movies/:id**

Returns a movie by route parameter `id`. Will return `404` if not found and `200` on success.

Example:
```sh
http :3000/api/movies/4k0upQGul # or some other real id
```

**POST - /api/movies**

Adds a movie. The body of the HTTP request must be a JSON object that conforms to the [movie schema](models/movie.schema.js). Will return `422` if the HTTP body is invalid and `201` on success. Will set the `location` HTTP header to the newly created movie.

Example:
```sh
http POST :3000/api/movies title=Dr.Strangelove genre=comedy description="Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb" producer=Metro-Goldwyn-Mayer rating=R retail=2.99
```

**PUT - /api/movies/:id**

Update any or all keys of a movie object by route parameter `id`. The body of the HTTP request must be a JSON object that conforms to the [movie schema](models/movie.schema.js). The `id` cannot be changed and all keys are optional. Will return `422` if the HTTP body is invalid, `404` if not found and `200` on success.

Example:
```sh
http PUT :3000/api/movies/4k0upQGul genre=horror
```

**DELETE - /api/movies/:id**

Delete a movie by route parameter `id`. Will return `404` if not found and `204` on success.

Example:
```sh
http DELETE :3000/api/movies/4k0upQGul
```
