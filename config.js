require('dotenv').config();

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  port: parseInt(process.env.PORT) || 3000,

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crmkiu',
  },

  jwtSecret: process.env.JWT_SECRET || (isDev ? 'dev-secret-key' : 'super-secret-key-change-me'),

  rateLimit: {
    windowMs: isDev ? 60 * 60 * 1000 : 15 * 60 * 1000, // dev: 1 час, prod: 15 мин
    max: isDev ? 1000 : 100,
  },

  cors: {
    origin: isDev
      ? ['http://localhost:5173', 'http://127.0.0.1:5173']
      : process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : ['https://your-domain.com'],
    credentials: true,
    optionsSuccessStatus: 200,
  },

  logging: {
    level: isDev ? 'debug' : 'info',
    pretty: isDev,
  },

  isDev,
};