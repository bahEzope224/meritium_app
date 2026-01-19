const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Obtenir tous les profils actifs (pour entreprises)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const profiles = await pool.query(
      'SELECT * FROM profiles WHERE is_active = true ORDER BY created_at DESC'
    );
    res.json(profiles.rows);
  } catch (error) {
    console.error('Erreur get profiles:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir un profil spécifique
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = await pool.query(
      'SELECT * FROM profiles WHERE id = $1 AND is_active = true',
      [id]
    );

    if (profile.rows.length === 0) {
      return res.status(404).json({ error: 'Profil non trouvé' });
    }

    res.json(profile.rows[0]);
  } catch (error) {
    console.error('Erreur get profile:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir mon profil (pour candidats)
router.get('/me/profile', authenticateToken, async (req, res) => {
  try {
    const profile = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (profile.rows.length === 0) {
      return res.status(404).json({ error: 'Profil non trouvé' });
    }

    res.json(profile.rows[0]);
  } catch (error) {
    console.error('Erreur get my profile:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour mon profil
router.put('/me/profile', authenticateToken, async (req, res) => {
  try {
    const { skills, experience, education, availability } = req.body;

    const updatedProfile = await pool.query(
      `UPDATE profiles 
       SET skills = $1, experience = $2, education = $3, availability = $4, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $5 
       RETURNING *`,
      [skills || [], experience || '', education || '', availability || '', req.user.id]
    );

    if (updatedProfile.rows.length === 0) {
      return res.status(404).json({ error: 'Profil non trouvé' });
    }

    res.json(updatedProfile.rows[0]);
  } catch (error) {
    console.error('Erreur update profile:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;