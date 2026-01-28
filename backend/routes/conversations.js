const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/conversations
 * Récupère toutes les conversations de l'utilisateur connecté
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query;
    let params;

    if (userRole === 'company') {
      // Entreprise : voir toutes ses conversations
      query = `
        SELECT 
          c.*,
          p.skills,
          (SELECT COUNT(*) FROM messages m 
           WHERE m.conversation_id = c.id 
           AND m.receiver_id = $1 
           AND m.is_read = false) as unread_count,
          (SELECT message_text FROM messages m 
           WHERE m.conversation_id = c.id 
           ORDER BY m.created_at DESC LIMIT 1) as last_message
        FROM conversations c
        JOIN profiles p ON c.profile_id = p.id
        WHERE c.company_id = $1
        ORDER BY c.last_message_at DESC NULLS LAST
      `;
      params = [userId];
    } else {
      // Candidat : voir conversations liées à son profil
      query = `
        SELECT 
          c.*,
          u.name as company_name,
          (SELECT COUNT(*) FROM messages m 
           WHERE m.conversation_id = c.id 
           AND m.receiver_id = $1 
           AND m.is_read = false) as unread_count,
          (SELECT message_text FROM messages m 
           WHERE m.conversation_id = c.id 
           ORDER BY m.created_at DESC LIMIT 1) as last_message
        FROM conversations c
        JOIN profiles p ON c.profile_id = p.id
        JOIN users u ON c.company_id = u.id
        WHERE p.user_id = $1
        ORDER BY c.last_message_at DESC NULLS LAST
      `;
      params = [userId];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/conversations
 * Créer ou récupérer une conversation existante
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { profileId } = req.body;
    const companyId = req.user.id;

    if (req.user.role !== 'company') {
      return res.status(403).json({ error: 'Seules les entreprises peuvent initier des conversations' });
    }

    // Vérifier si une conversation existe déjà
    const existing = await pool.query(
      'SELECT * FROM conversations WHERE company_id = $1 AND profile_id = $2',
      [companyId, profileId]
    );

    if (existing.rows.length > 0) {
      return res.json(existing.rows[0]);
    }

    // Créer nouvelle conversation
    const newConv = await pool.query(
      `INSERT INTO conversations (company_id, profile_id, initiated_by)
       VALUES ($1, $2, 'company')
       RETURNING *`,
      [companyId, profileId]
    );

    // Créer message système de bienvenue
    const candidateUserId = await pool.query(
      'SELECT user_id FROM profiles WHERE id = $1',
      [profileId]
    );

    if (candidateUserId.rows.length > 0) {
      await pool.query(
        `INSERT INTO messages (conversation_id, sender_id, receiver_id, message_text, message_type)
         VALUES ($1, $2, $3, $4, 'system')`,
        [
          newConv.rows[0].id,
          companyId,
          candidateUserId.rows[0].user_id,
          'Cette entreprise a manifesté son intérêt pour votre profil. Vous pouvez désormais échanger de manière anonyme et sécurisée.'
        ]
      );
    }

    res.status(201).json(newConv.rows[0]);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/conversations/:id/messages
 * Récupère tous les messages d'une conversation
 */
router.get('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await pool.query(
      `SELECT c.*, p.user_id as candidate_user_id
       FROM conversations c
       JOIN profiles p ON c.profile_id = p.id
       WHERE c.id = $1`,
      [id]
    );

    if (conversation.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    const conv = conversation.rows[0];
    const isAuthorized = conv.company_id === userId || conv.candidate_user_id === userId;

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Récupérer les messages
    const messages = await pool.query(
      `SELECT * FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    // Marquer comme lus les messages reçus
    await pool.query(
      `UPDATE messages
       SET is_read = true
       WHERE conversation_id = $1
       AND receiver_id = $2
       AND is_read = false`,
      [id, userId]
    );

    res.json(messages.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/conversations/:id/messages
 * Envoyer un message dans une conversation
 */
router.post('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { messageText } = req.body;
    const userId = req.user.id;

    if (!messageText || messageText.trim().length === 0) {
      return res.status(400).json({ error: 'Le message ne peut pas être vide' });
    }

    if (messageText.length > 5000) {
      return res.status(400).json({ error: 'Le message est trop long (max 5000 caractères)' });
    }

    // Vérifier autorisation
    const conversation = await pool.query(
      `SELECT c.*, p.user_id as candidate_user_id
       FROM conversations c
       JOIN profiles p ON c.profile_id = p.id
       WHERE c.id = $1`,
      [id]
    );

    if (conversation.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    const conv = conversation.rows[0];
    const isCompany = conv.company_id === userId;
    const isCandidate = conv.candidate_user_id === userId;

    if (!isCompany && !isCandidate) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const receiverId = isCompany ? conv.candidate_user_id : conv.company_id;

    // Créer le message
    const newMessage = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, receiver_id, message_text)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, userId, receiverId, messageText.trim()]
    );

    res.status(201).json(newMessage.rows[0]);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
