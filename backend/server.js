const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ===========================
   CORS CONFIG (IMPORTANT)
=========================== */
const corsOptions = {
  origin: 'http://localhost:5173', // Frontend Vite
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

/* ===========================
   MIDDLEWARES
=========================== */
app.use(express.json());

/* ===========================
   ROUTES
=========================== */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/interests', require('./routes/interests'));

/* ===========================
   HEALTH CHECK
=========================== */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Meritium API is running',
    timestamp: new Date().toISOString()
  });
});

/* ===========================
   404 HANDLER
=========================== */
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});


app.use((req, res, next) => {
  console.log('➡️', req.method, req.url);
  next();
});

/* ===========================
   ERROR HANDLER
=========================== */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

/* ===========================
   START SERVER
=========================== */
app.listen(PORT, () => {
  console.log(`🚀 Serveur Meritium lancé sur http://localhost:${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
});
