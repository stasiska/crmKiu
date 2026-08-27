const { verifyToken } = require('../services/authService');

function authMiddleware(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
  req.user = decoded;
  next();
}

// Проверка, что пользователь имеет одну из разрешённых ролей
function checkRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'У вас нет прав для выполнения этого действия' });
    }
    next();
  };
}

// Проверка, что пользователь является администратором (сокращение)
function isAdmin(req, res, next) {
  return checkRole('admin')(req, res, next);
}

// Проверка, что пользователь является менеджером или администратором
function isManagerOrAdmin(req, res, next) {
  return checkRole('admin', 'manager')(req, res, next);
}

module.exports = { authMiddleware, checkRole, isAdmin, isManagerOrAdmin };
