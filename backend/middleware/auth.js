const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // Laisser passer les preflight CORS
  if (req.method === 'OPTIONS') return next();

  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : (authHeader ? authHeader.trim() : null);

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  if (!process.env.JWT_SECRET) {
    // Mauvaise config serveur : mieux que renvoyer un 403 trompeur
    return res.status(500).json({ error: 'Configuration serveur invalide (JWT_SECRET manquant)' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // 401 est plus approprié que 403 pour "token invalide/expiré"
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expiré' });
      }
      return res.status(401).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
