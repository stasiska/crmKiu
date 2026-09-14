require('dotenv').config();

const isDev = process.env.NODE_ENV === 'development';

// Проверка обязательных переменных окружения
if (!process.env.JWT_SECRET) {
  console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: JWT_SECRET не установлен в .env файле');
  console.error('Сгенерируйте надежный ключ: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  process.exit(1);
}

if (!process.env.ENCRYPTION_KEY) {
  console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: ENCRYPTION_KEY не установлен в .env файле');
  console.error('Сгенерируйте ключ: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(1);
}

// Проверка минимальной длины JWT_SECRET
if (process.env.JWT_SECRET.length < 32) {
  console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: JWT_SECRET слишком короткий (минимум 32 символа)');
  process.exit(1);
}

module.exports = {
  port: parseInt(process.env.PORT) || 3000,

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crmkiu',
  },

  jwtSecret: process.env.JWT_SECRET,
  encryptionKey: process.env.ENCRYPTION_KEY,

  // Email настройки
  duplicateDays: parseInt(process.env.DUPLICATE_DAYS) || 1,
  rateLimitCount: parseInt(process.env.RATE_LIMIT_COUNT) || 10,
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 600000,
  maxDailySent: parseInt(process.env.MAX_DAILY_SENT) || 150,

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