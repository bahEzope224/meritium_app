const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Obtenir mes conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await pool.query(
      `SELECT DISTINCT ON (interest_id) 
        m.*,
        i.company_id,
        i.profile_id,
        CASE 
          WHEN m.sender_id = $1 THEN u_receiver.name
          ELSE u_sender.name
        END as other_user_name
      FROM messages m
      JOIN interests i ON m.interest_id = i.id
      LEFT JOIN users u_sender ON m.sender_id = u_sender.id
      LEFT JOIN users u_receiver ON m.receiver_id = u_receiver.id
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      ORDER BY interest_id, m.created_at DESC`,
      [req.user.id]
    );

    res.json(conversations.rows);
  } catch (error) {
    console.error('Erreur get conversations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir les messages d'une conversation
router.get('/conversation/:interestId', authenticateToken, async (req, res) => {
  try {
    const { interestId } = req.params;

    const messages = await pool.query(
      `SELECT m.*, u.name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.interest_id = $1
       ORDER BY m.created_at ASC`,
      [interestId]
    );

    res.json(messages.rows);
  } catch (error) {
    console.error('Erreur get messages:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Envoyer un message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { receiver_id, interest_id, message_text } = req.body;

    const newMessage = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, interest_id, message_text)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, receiver_id, interest_id, message_text]
    );

    res.status(201).json(newMessage.rows[0]);
  } catch (error) {
    console.error('Erreur send message:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Marquer un message comme lu
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const updatedMessage = await pool.query(
      `UPDATE messages 
       SET is_read = true 
       WHERE id = $1 AND receiver_id = $2
       RETURNING *`,
      [id, req.user.id]
    );

    if (updatedMessage.rows.length === 0) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }

    res.json(updatedMessage.rows[0]);
  } catch (error) {
    console.error('Erreur mark as read:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;