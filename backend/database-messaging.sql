-- =====================================================
-- SYSTÈME DE MESSAGERIE ET NOTIFICATIONS - MERITIUM
-- =====================================================

-- TABLE : conversations
-- Gère les conversations entre entreprises et candidats
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
    initiated_by VARCHAR(20) NOT NULL CHECK (initiated_by IN ('company', 'candidate')),
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, profile_id)
);

CREATE INDEX idx_conversations_company ON conversations(company_id);
CREATE INDEX idx_conversations_profile ON conversations(profile_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- TABLE : messages
-- Stocke tous les messages échangés
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'audio', 'system')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_message_length CHECK (char_length(message_text) > 0 AND char_length(message_text) <= 5000)
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_unread ON messages(receiver_id, is_read) WHERE is_read = false;
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- TABLE : notifications
-- Système de notifications pour toutes les actions
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'interest_received',
        'message_received',
        'profile_viewed',
        'conversation_started',
        'identity_reveal_request'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50), -- 'conversation', 'message', 'profile', 'interest'
    related_entity_id INTEGER,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    action_url TEXT,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- TABLE : notification_preferences
-- Préférences de notification par utilisateur
CREATE TABLE notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interest_received_email BOOLEAN DEFAULT true,
    interest_received_push BOOLEAN DEFAULT true,
    message_received_email BOOLEAN DEFAULT true,
    message_received_push BOOLEAN DEFAULT true,
    daily_digest BOOLEAN DEFAULT false,
    weekly_summary BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- TABLE : conversation_participants
-- Métadonnées sur la participation à une conversation
CREATE TABLE conversation_participants (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('company', 'candidate')),
    last_read_at TIMESTAMP,
    is_muted BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_conv_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_conv_participants_conv ON conversation_participants(conversation_id);

-- =====================================================
-- FONCTIONS & TRIGGERS
-- =====================================================

-- Fonction : Créer notification lors d'un intérêt
CREATE OR REPLACE FUNCTION notify_interest_received()
RETURNS TRIGGER AS $$
DECLARE
    candidate_user_id INTEGER;
    company_name VARCHAR(255);
BEGIN
    -- Récupérer l'ID utilisateur du candidat via le profil
    SELECT user_id INTO candidate_user_id
    FROM profiles
    WHERE id = NEW.profile_id;
    
    -- Récupérer le nom de l'entreprise
    SELECT name INTO company_name
    FROM users
    WHERE id = NEW.company_id;
    
    -- Créer la notification
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        related_entity_type,
        related_entity_id,
        action_url,
        priority
    ) VALUES (
        candidate_user_id,
        'interest_received',
        'Nouvelle opportunité !',
        'Une entreprise a manifesté son intérêt pour votre profil. Vous pouvez désormais échanger anonymement.',
        'interest',
        NEW.id,
        '/dashboard/messaging',
        'high'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur les intérêts
CREATE TRIGGER trigger_notify_interest
    AFTER INSERT ON interests
    FOR EACH ROW
    EXECUTE FUNCTION notify_interest_received();

-- Fonction : Créer notification lors d'un nouveau message
CREATE OR REPLACE FUNCTION notify_message_received()
RETURNS TRIGGER AS $$
DECLARE
    receiver_name VARCHAR(255);
BEGIN
    -- Ne pas notifier les messages système
    IF NEW.message_type = 'system' THEN
        RETURN NEW;
    END IF;
    
    -- Créer la notification pour le destinataire
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        related_entity_type,
        related_entity_id,
        action_url,
        priority
    ) VALUES (
        NEW.receiver_id,
        'message_received',
        'Nouveau message',
        substring(NEW.message_text, 1, 100) || CASE WHEN char_length(NEW.message_text) > 100 THEN '...' ELSE '' END,
        'message',
        NEW.id,
        '/dashboard/messaging?conversation=' || NEW.conversation_id,
        'normal'
    );
    
    -- Mettre à jour last_message_at dans conversations
    UPDATE conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur les messages
CREATE TRIGGER trigger_notify_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_message_received();

-- Fonction : Marquer message comme lu
CREATE OR REPLACE FUNCTION mark_message_read()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = true AND OLD.is_read = false THEN
        NEW.read_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mark_message_read
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION mark_message_read();

-- Fonction : Nettoyer les anciennes notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM notifications
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND is_read = true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VUES UTILES
-- =====================================================

-- Vue : Conversations avec détails
CREATE VIEW v_conversations_detailed AS
SELECT 
    c.id,
    c.company_id,
    c.profile_id,
    c.status,
    c.last_message_at,
    u_company.name as company_name,
    u_company.email as company_email,
    p.user_id as candidate_user_id,
    u_candidate.name as candidate_name,
    (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) as message_count,
    (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.is_read = false AND m.receiver_id = p.user_id) as unread_count_candidate,
    (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.is_read = false AND m.receiver_id = c.company_id) as unread_count_company,
    c.created_at
FROM conversations c
JOIN users u_company ON c.company_id = u_company.id
JOIN profiles p ON c.profile_id = p.id
JOIN users u_candidate ON p.user_id = u_candidate.id;

-- Vue : Notifications non lues par utilisateur
CREATE VIEW v_unread_notifications AS
SELECT 
    user_id,
    COUNT(*) as unread_count,
    COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_count,
    COUNT(*) FILTER (WHERE priority = 'high') as high_priority_count
FROM notifications
WHERE is_read = false
GROUP BY user_id;

-- =====================================================
-- DONNÉES DE TEST
-- =====================================================

-- Préférences de notification par défaut pour utilisateurs existants
INSERT INTO notification_preferences (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE conversations IS 'Gère les conversations entre entreprises et profils candidats anonymisés';
COMMENT ON TABLE messages IS 'Stocke tous les messages échangés dans le système';
COMMENT ON TABLE notifications IS 'Système centralisé de notifications pour toutes les actions utilisateur';
COMMENT ON TABLE notification_preferences IS 'Préférences de notification personnalisables par utilisateur';
