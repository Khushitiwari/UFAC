import { ApiError } from '../utils/ApiError.js';

/**
 * Generic Zod validation middleware.
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    return next(new ApiError(400, message));
  }

  req[source] = result.data;
  next();
};

export default validate;
