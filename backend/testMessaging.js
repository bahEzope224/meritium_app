const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

let companyToken = '';
let candidateToken = '';
let conversationId = 0;
let candidateId = 0;
let profileId = 0;

async function main() {
  try {
    console.log('--- STEP 1: Création des utilisateurs ---');

    // Créer company
    const companyRes = await axios.post(`${API_URL}/auth/signup`, {
      name: 'Test Company',
      email: 'company@test.com',
      password: 'password123',
      role: 'company'
    });
    console.log('Company créé :', companyRes.data.user);
    
    // Connexion company
    const loginCompany = await axios.post(`${API_URL}/auth/login`, {
      email: 'company@test.com',
      password: 'password123'
    });
    companyToken = loginCompany.data.token;
    console.log('Token company:', companyToken);

    // Créer candidate
    const candidateRes = await axios.post(`${API_URL}/auth/signup`, {
      name: 'Test Candidate',
      email: 'candidate@test.com',
      password: 'password123',
      role: 'candidate'
    });
    candidateId = candidateRes.data.user.id;
    console.log('Candidate créé :', candidateRes.data.user);

    // Créer profil pour candidate
    const profileRes = await axios.post(`${API_URL}/profiles`, 
      { title: 'Développeur', summary: 'Junior dev' },
      { headers: { Authorization: `Bearer ${candidateRes.data.token}` } }
    );
    profileId = profileRes.data.id;
    console.log('Profil candidate créé :', profileRes.data);

    // Connexion candidate
    const loginCandidate = await axios.post(`${API_URL}/auth/login`, {
      email: 'candidate@test.com',
      password: 'password123'
    });
    candidateToken = loginCandidate.data.token;
    console.log('Token candidate:', candidateToken);

    console.log('--- STEP 2: Créer une conversation ---');

    const convRes = await axios.post(`${API_URL}/conversations`, 
      { profileId },
      { headers: { Authorization: `Bearer ${companyToken}` } }
    );
    conversationId = convRes.data.id;
    console.log('Conversation créée :', convRes.data);

    console.log('--- STEP 3: Envoyer un message ---');

    const msgRes = await axios.post(`${API_URL}/conversations/${conversationId}/messages`,
      { messageText: 'Bonjour, intéressé par votre profil !' },
      { headers: { Authorization: `Bearer ${companyToken}` } }
    );
    console.log('Message envoyé :', msgRes.data);

    console.log('--- STEP 4: Candidate récupère les messages ---');

    const messagesRes = await axios.get(`${API_URL}/conversations/${conversationId}/messages`, 
      { headers: { Authorization: `Bearer ${candidateToken}` } }
    );
    console.log('Messages reçus par candidate :', messagesRes.data);

    console.log('--- STEP 5: Vérifier notification ---');

    const notificationsRes = await axios.get(`${API_URL}/notifications`, 
      { headers: { Authorization: `Bearer ${candidateToken}` } }
    );
    console.log('Notifications candidate :', notificationsRes.data);

    console.log('✅ Test complet : communication fonctionnelle !');

  } catch (err) {
    console.error('❌ Erreur durant le test :', err.response?.data || err.message);
  }
}

main();
