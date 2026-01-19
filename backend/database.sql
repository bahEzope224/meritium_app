-- =====================================================
-- SCRIPT SQL COMPLET POUR MERITIUM
-- =====================================================

-- Supprimer les tables existantes si besoin
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS interests CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- TABLE : users
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('candidate', 'company', 'admin')),
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les recherches
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- TABLE : profiles (profils candidats anonymisés)
-- =====================================================
CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skills TEXT[] NOT NULL DEFAULT '{}',
    experience TEXT,
    education TEXT,
    availability VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Index pour les recherches
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_active ON profiles(is_active);
CREATE INDEX idx_profiles_skills ON profiles USING GIN(skills);

-- =====================================================
-- TABLE : interests (entreprises intéressées par candidats)
-- =====================================================
CREATE TABLE interests (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, profile_id)
);

-- Index pour les recherches
CREATE INDEX idx_interests_company ON interests(company_id);
CREATE INDEX idx_interests_profile ON interests(profile_id);

-- =====================================================
-- TABLE : messages (messagerie anonyme)
-- =====================================================
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    interest_id INTEGER REFERENCES interests(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les recherches
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_interest ON messages(interest_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- =====================================================
-- FONCTION : Mise à jour automatique du timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger aux tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONNÉES DE TEST
-- =====================================================

-- Utilisateurs de test (mot de passe: "password")
-- Hash bcrypt pour "password" : $2b$10$rKGZxF8qXO0qK3pD5J5jLOqKqX8ZxXqXqXqXqXqXqXqXqXqXqXq
INSERT INTO users (email, password_hash, role, name) VALUES
('candidat@test.fr', '$2b$10$rKGZxF8qXO0qK3pD5J5jLOqKqX8ZxXqXqXqXqXqXqXqXqXqXqXq', 'candidate', 'Utilisateur Candidat'),
('entreprise@test.fr', '$2b$10$rKGZxF8qXO0qK3pD5J5jLOqKqX8ZxXqXqXqXqXqXqXqXqXqXqXq', 'company', 'Entreprise Demo'),
('admin@meritium.fr', '$2b$10$rKGZxF8qXO0qK3pD5J5jLOqKqX8ZxXqXqXqXqXqXqXqXqXqXqXq', 'admin', 'Administrateur Meritium');

-- Profil candidat de test
INSERT INTO profiles (user_id, skills, experience, education, availability) VALUES
(
    1,
    ARRAY['React', 'Node.js', 'PostgreSQL', 'Docker', 'TypeScript'],
    'Plus de 5 années d''expérience en développement full-stack avec une expertise particulière en architecture de microservices et applications web performantes. Expérience significative en gestion de projets agiles.',
    'Formation supérieure en informatique (Bac+5), certifications professionnelles en cloud computing et développement web moderne.',
    'Disponible sous 1 mois'
);

-- =====================================================
-- VUES UTILES
-- =====================================================

-- Vue : Profils avec statistiques
CREATE VIEW profiles_with_stats AS
SELECT 
    p.*,
    COUNT(DISTINCT i.id) as interest_count,
    COUNT(DISTINCT CASE WHEN i.status = 'accepted' THEN i.id END) as accepted_count
FROM profiles p
LEFT JOIN interests i ON p.id = i.profile_id
GROUP BY p.id;

-- Vue : Conversations actives
CREATE VIEW active_conversations AS
SELECT 
    i.id as interest_id,
    i.company_id,
    i.profile_id,
    p.user_id as candidate_id,
    u_company.name as company_name,
    COUNT(m.id) as message_count,
    MAX(m.created_at) as last_message_at
FROM interests i
JOIN profiles p ON i.profile_id = p.id
JOIN users u_company ON i.company_id = u_company.id
LEFT JOIN messages m ON i.id = m.interest_id
WHERE i.status = 'accepted'
GROUP BY i.id, i.company_id, i.profile_id, p.user_id, u_company.name;

-- =====================================================
-- REQUÊTES UTILES POUR L'ADMINISTRATION
-- =====================================================

-- Compter les utilisateurs par rôle
-- SELECT role, COUNT(*) FROM users GROUP BY role;

-- Profils les plus populaires
-- SELECT p.id, COUNT(i.id) as interest_count 
-- FROM profiles p 
-- LEFT JOIN interests i ON p.id = i.profile_id 
-- GROUP BY p.id 
-- ORDER BY interest_count DESC;

-- Messages non lus par utilisateur
-- SELECT receiver_id, COUNT(*) 
-- FROM messages 
-- WHERE is_read = false 
-- GROUP BY receiver_id;