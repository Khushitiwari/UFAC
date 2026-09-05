import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { isOriginAllowed } from './config/env.js';
import { globalRateLimiter } from './middlewares/rateLimiter.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import apiRoutes from './routes/index.js';

const app = express();

app.set('etag', false);


app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '10kb' }));
app.use(globalRateLimiter);
app.use(requestLogger);

app.use('/api/v1', (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
}, apiRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

export default app;
