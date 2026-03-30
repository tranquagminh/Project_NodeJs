import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: [env.CLIENT_URL, env.ADMIN_URL],
  credentials: true,
}));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Compression & Logging
app.use(compression());
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api', routes);

// Global error handler
app.use(errorHandler);

export default app;
