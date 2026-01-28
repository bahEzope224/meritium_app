const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// PUBLIC (test)
router.get('/test', (req, res) => {
  res.json({ message: 'Profiles route OK' });
});

// PROTÉGÉ
router.get('/', authenticateToken, async (req, res) => {
  res.json([]);
});

module.exports = router;
