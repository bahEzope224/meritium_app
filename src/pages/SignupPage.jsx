import React, { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

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

const saveUsersToStorage = (users) => {
  localStorage.setItem('meritium_all_users', JSON.stringify(users));
};

const checkEmailExists = (email) => {
  const users = getUsersFromStorage();
  const allUsers = [...users.candidates, ...users.companies];
  return allUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
};

const addNewUser = (newUser) => {
  const users = getUsersFromStorage();
  
  if (newUser.role === 'candidate') {
    users.candidates.push(newUser);
  } else {
    users.companies.push(newUser);
  }
  
  saveUsersToStorage(users);
};

const SignupPage = ({ onNavigate, onLogin }) => {
  const [role, setRole] = useState('candidate');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (newEmail && checkEmailExists(newEmail)) {
      setErrors(prev => ({ ...prev, email: 'Cette adresse email est déjà utilisée' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format d'email invalide";
    } else if (checkEmailExists(email)) {
      newErrors.email = 'Cette adresse email est déjà utilisée';
    }

    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = () => {
    if (!validateForm()) {
      return;
    }

    setIsChecking(true);

    setTimeout(() => {
      const newUser = {
        id: Date.now(),
        email: email.trim(),
        name: name.trim(),
        role,
        password
      };

      addNewUser(newUser);
      setSuccess(true);
      
      setTimeout(() => {
        onLogin(newUser);
        onNavigate('dashboard');
      }, 2000);
    }, 500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Compte créé avec succès !
          </h2>
          <p className="text-gray-600 mb-4">
            Bienvenue sur Meritium, {name}
          </p>
          <p className="text-sm text-gray-500">
            Redirection vers votre tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  const InputField = ({ label, type = 'text', value, onChange, placeholder, onKeyPress, error }) => (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 sm:p-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8">
          Créer votre compte
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Je suis
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="candidate">Un candidat à la recherche d'opportunités</option>
              <option value="company">Une entreprise qui recrute</option>
            </select>
          </div>

          <InputField
            label="Nom complet / Nom de l'entreprise"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom"
            error={errors.name}
          />

          <InputField
            label="Adresse email professionnelle"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="votre.email@example.com"
            error={errors.email}
          />

          <InputField
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 caractères"
            error={errors.password}
          />

          <InputField
            label="Confirmer le mot de passe"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSignup()}
            placeholder="Répétez votre mot de passe"
            error={errors.confirmPassword}
          />

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm text-indigo-900 leading-relaxed">
              {role === 'candidate' 
                ? "🔒 Votre identité restera confidentielle. Seules vos compétences seront visibles par les recruteurs."
                : "✅ Accédez à des profils de talents évalués uniquement sur leurs compétences réelles."}
            </p>
          </div>

          <button
            onClick={handleSignup}
            disabled={isChecking || Object.keys(errors).length > 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? 'Vérification...' : 'Créer mon compte Meritium'}
          </button>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="w-full mt-6 text-gray-600 hover:text-gray-800 text-sm"
        >
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  );
};

export default SignupPage;
