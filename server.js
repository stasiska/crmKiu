const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');

const app = express();

// ---- Security (production) ----
if (!config.isDev) {
  app.use(helmet());
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
app.use(express.json());

// ---- Static files (если есть) ----
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
  console.log(`🚀 CRM запущена в режиме ${config.isDev ? 'DEVELOPMENT' : 'PRODUCTION'} на порту ${config.port}`);
});