const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/interests
 * Récupère tous les intérêts de l'entreprise
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ error: 'Réservé aux entreprises' });
    }

    const interests = await pool.query(
      'SELECT * FROM interests WHERE company_id = $1',
      [req.user.id]
    );

    res.json(interests.rows);
  } catch (error) {
    console.error('Error fetching interests:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/interests
 * Créer un nouvel intérêt
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { profileId } = req.body;
    const companyId = req.user.id;

    if (req.user.role !== 'company') {
      return res.status(403).json({ error: 'Réservé aux entreprises' });
    }

    // Vérifier si l'intérêt existe déjà
    const existing = await pool.query(
      'SELECT * FROM interests WHERE company_id = $1 AND profile_id = $2',
      [companyId, profileId]
    );

    if (existing.rows.length > 0) {
      return res.json(existing.rows[0]);
    }

    // Créer l'intérêt
    const newInterest = await pool.query(
      'INSERT INTO interests (company_id, profile_id) VALUES ($1, $2) RETURNING *',
      [companyId, profileId]
    );

    res.status(201).json(newInterest.rows[0]);
  } catch (error) {
    console.error('Error creating interest:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/interests/:profileId
 * Supprimer un intérêt
 */
router.delete('/:profileId', authenticateToken, async (req, res) => {
  try {
    const { profileId } = req.params;
    const companyId = req.user.id;

    if (req.user.role !== 'company') {
      return res.status(403).json({ error: 'Réservé aux entreprises' });
    }

    await pool.query(
      'DELETE FROM interests WHERE company_id = $1 AND profile_id = $2',
      [companyId, profileId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting interest:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
