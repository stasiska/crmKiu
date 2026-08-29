const db = require('../db');
const config = require('../config');

async function getRecentCount(senderId) {
  const windowSeconds = config.rateLimit.windowMs / 1000;
  return await db.getRecentCount(senderId, windowSeconds);
}

async function getDailyCount(senderId) {
  return await db.getDailyCount(senderId);
}

async function canSend(senderId) {
  const recent = await getRecentCount(senderId);
  if (recent >= config.rateLimitCount) {
    return { allowed: false, reason: 'rate_limit' };
  }
  const daily = await getDailyCount(senderId);
  if (daily >= config.maxDailySent) {
    return { allowed: false, reason: 'daily_limit' };
  }
  return { allowed: true };
}

module.exports = { getRecentCount, getDailyCount, canSend };