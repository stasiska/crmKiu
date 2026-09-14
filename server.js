const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser'); // <-- добавить
const config = require('./config');

const app = express();

// ---- Security Headers ----
// Базовые заголовки безопасности (для всех режимов)
app.use((req, res, next) => {
  // Content Security Policy - защита от XSS
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' http://localhost:3000 http://localhost:5173; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );

  // Защита от Clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Защита от MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS Protection (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
});

// ---- Security (production) ----
if (!config.isDev) {
  app.use(helmet({
    contentSecurityPolicy: false, // уже настроен выше
    frameguard: false, // уже настроен выше
  }));
  app.disable('x-powered-by');
}

// ---- CORS ----
app.use(cors(config.cors));

// ---- Rate limiting ----
if (!config.isDev) {
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);
}

// ---- Body parsing ----
app.use(express.json({ limit: '10mb' }));   // <-- добавлен лимит
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());                    // <-- для чтения кук

// ---- Static files ----
app.use(express.static('public'));

// ---- API routes ----
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

// ---- Health check ----
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// ---- Error handler ----
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = config.isDev ? err.message : 'Внутренняя ошибка сервера';
  res.status(status).json({ error: message });
});

// ---- Запуск ----
app.listen(config.port, () => {
  console.log(`CRM запущена в режиме ${config.isDev ? 'DEVELOPMENT' : 'PRODUCTION'} на порту ${config.port}`);
});