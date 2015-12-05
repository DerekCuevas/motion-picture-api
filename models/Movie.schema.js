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

export const schema = {
    id: Joi.string().length(10).forbidden(),
    title: Joi.string().max(256).required(),
    genre: Joi.valid(genres).required(),
};
