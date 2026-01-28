const express = require('express');
const router = express.Router();

// test
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route OK' });
});

module.exports = router;
