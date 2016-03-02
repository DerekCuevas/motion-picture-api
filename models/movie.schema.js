import Joi from 'joi';

export const genres = [
    'sci-fi and fantasy',
    'comedy',
    'action and adventure',
    'drama',
    'horror',
    'documentary',
    'kids and family',
    'thriller',
];

export const producers = [
    'universal studios',
    'metro-goldwyn-mayer',
    'united artists',
    'paramount pictures',
    'tristar pictures',
    'warner bros. pictures',
    '20th century fox',
    'magnolia pictures',
    'pixar animation studios',
    'miramax films',
];

export const ratings = [
    'G',
    'PG',
    'PG-13',
    'R',
    'NC-17',
];

export const schema = {
    id: Joi.string().length(10).forbidden(),
    created_at: Joi.date().iso().forbidden(),
    updated_at: Joi.date().iso().forbidden(),

    title: Joi.string().max(64).required(),
    genre: Joi.valid(genres).required(),
    description: Joi.string().max(1024).required(),
    producer: Joi.valid(producers).required(),
    retail: Joi.number().positive().precision(2).required(),
    rating: Joi.valid(ratings).required(),
    img: Joi.string().max(256),
};
