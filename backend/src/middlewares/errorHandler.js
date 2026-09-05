import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ZodError') {
    statusCode = 400;
    message = err.errors?.map((e) => e.message).join(', ') || 'Validation failed';
  }

  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'A record with this unique value already exists';
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} — ${message}`, {
      stack: err.stack,
      ...(err.details && { details: err.details }),
    });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} — ${message}`);
  }

  const response = {
    success: false,
    error: message,
  };

  if (env.NODE_ENV === 'development' && statusCode >= 500) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

export default errorHandler;
