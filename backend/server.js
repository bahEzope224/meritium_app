const express = require('express');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });


const app = express();
const PORT = process.env.PORT || 5000;
console.log('JWT_SECRET chargé ?', !!process.env.JWT_SECRET);


/* ===========================
   CORS CONFIG 
=========================== */
const corsOptions = {
  // On autorise les deux formats d'URL pour être sûr
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// C'est cette ligne seule qui va gérer le CORS et le Preflight automatiquement
app.use(cors(corsOptions)); 

/* ===========================
   REQUEST LOGGER
=========================== */
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});

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
   404 & ERROR HANDLER
=========================== */
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

/* ===========================
   START SERVER
=========================== */
app.listen(PORT, () => {
  console.log(`🚀 Serveur Meritium lancé sur http://localhost:${PORT}`);
});
