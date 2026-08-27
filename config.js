require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT) || 3000,
  duplicateDays: parseInt(process.env.DUPLICATE_DAYS) || 30,
  rateLimitCount: parseInt(process.env.RATE_LIMIT_COUNT) || 10,
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 600000, // 10 мин
  maxDailySent: parseInt(process.env.MAX_DAILY_SENT) || 150,
};