import React, { useState } from 'react';
import { Building2, User, AlertCircle } from 'lucide-react';

const getUsersFromStorage = () => {
  const stored = localStorage.getItem('meritium_all_users');
  if (stored) return JSON.parse(stored);
  
  const defaultUsers = {
    candidates: [
      { id: 1, email: 'candidat@test.fr', password: 'password', role: 'candidate', name: 'Utilisateur Candidat' }
    ],
    companies: [
      { id: 2, email: 'entreprise@test.fr', password: 'password', role: 'company', name: 'Entreprise Demo' }
    ]
  };
  
  localStorage.setItem('meritium_all_users', JSON.stringify(defaultUsers));
  return defaultUsers;
};

const LoginPage = ({ type, onNavigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isCompany = type === 'company';

  const handleLogin = () => {
    setError('');
    const users = getUsersFromStorage();
    const userList = isCompany ? users.companies : users.candidates;
    const user = userList.find(u => u.email === email && u.password === password);

    if (user) {
      onLogin(user);
      onNavigate('dashboard');
    } else {
      setError('Identifiants incorrects. Veuillez vérifier votre email et mot de passe.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
            {isCompany ? (
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
            ) : (
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            {isCompany ? 'Espace Entreprise' : 'Espace Candidat'}
          </h2>
          <p className="text-gray-600">
            {isCompany 
              ? 'Accédez à votre plateforme de recrutement équitable' 
              : 'Connectez-vous pour gérer votre profil de compétences'}
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder={isCompany ? 'entreprise@example.com' : 'candidat@example.com'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Votre mot de passe sécurisé"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Se connecter
          </button>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="w-full mt-6 text-gray-600 hover:text-gray-800 text-sm"
        >
          ← Retour à l'accueil
        </button>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center mb-2">
            <strong>Compte de démonstration :</strong>
          </p>
          <p className="text-xs text-gray-500 text-center font-mono">
            {isCompany ? 'entreprise@test.fr' : 'candidat@test.fr'} / password
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
