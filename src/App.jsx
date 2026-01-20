import React, { createContext, useContext, useState, useEffect } from 'react';
import { Building2, User, CheckCircle, MessageSquare, LogOut, Send, Mic, Award, Shield, Zap, ArrowRight } from 'lucide-react';

// AUTH CONTEXT
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('meritium_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('meritium_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('meritium_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// MOCK DATA
const MOCK_USERS = {
  candidates: [
    { id: 1, email: 'candidat@test.fr', password: 'password', role: 'candidate', name: 'Utilisateur Candidat' }
  ],
  companies: [
    { id: 2, email: 'entreprise@test.fr', password: 'password', role: 'company', name: 'Entreprise Demo' }
  ]
};

const MOCK_PROFILES = [
  {
    id: 1,
    candidateId: 1,
    skills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'TypeScript'],
    experience: 'Plus de 5 années d\'expérience en développement full-stack avec une expertise particulière en architecture de microservices et applications web performantes.',
    education: 'Formation supérieure en informatique (Bac+5), certifications professionnelles en cloud computing.',
    availability: 'Disponible sous 1 mois',
  }
];

// COMPONENTS
const PrimaryButton = ({ children, onClick, className = '', fullWidth = false }) => (
  <button
    onClick={onClick}
    className={`bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg ${fullWidth ? 'w-full' : ''} ${className}`}
  >
    {children}
  </button>
);

const Input = ({ label, type = 'text', value, onChange, placeholder, onKeyPress }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
    />
  </div>
);

const ActionCard = ({ icon: Icon, title, subtitle, onClick, color = 'indigo' }) => {
  const colorClasses = {
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700'
  };

  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} text-white p-6 sm:p-8 rounded-xl transition-all transform hover:scale-105 shadow-lg w-full`}
    >
      <Icon className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3" />
      <h3 className="font-semibold text-lg sm:text-xl mb-2">{title}</h3>
      <p className="text-sm opacity-90">{subtitle}</p>
    </button>
  );
};

// PAGE HOME
const HomePage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold text-indigo-600 mb-4 sm:mb-6">
            Meritium
          </h1>
          <p className="text-xl sm:text-3xl text-gray-800 font-semibold mb-3 sm:mb-4 px-4">
            Votre talent mérite d'être reconnu sans préjugé
          </p>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            La première plateforme de recrutement 100% équitable où seules vos compétences parlent pour vous
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-20 max-w-5xl mx-auto">
          <ActionCard
            icon={Building2}
            title="Espace Entreprise"
            subtitle="Recrutez les meilleurs talents"
            onClick={() => onNavigate('login-company')}
            color="indigo"
          />
          <ActionCard
            icon={User}
            title="Espace Candidat"
            subtitle="Valorisez vos compétences"
            onClick={() => onNavigate('login-candidate')}
            color="green"
          />
          <ActionCard
            icon={ArrowRight}
            title="Créer un compte"
            subtitle="Rejoignez le mouvement"
            onClick={() => onNavigate('signup')}
            color="purple"
          />
        </div>

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 sm:p-12 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Notre mission</h2>
          <p className="text-base sm:text-lg leading-relaxed max-w-3xl mx-auto text-center">
            Meritium transforme le recrutement en éliminant les biais inconscients. En masquant les informations personnelles identifiantes, nous permettons aux recruteurs de se concentrer sur l'essentiel : les compétences, l'expérience et le potentiel.
          </p>
        </div>

        <div className="text-center mt-12 sm:mt-16 text-gray-600 text-sm">
          <p>© 2026 Meritium - Pour un recrutement plus juste et équitable</p>
        </div>
      </div>
    </div>
  );
};

// PAGE LOGIN
const LoginPage = ({ type, onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isCompany = type === 'company';

  const handleLogin = () => {
    setError('');
    const users = isCompany ? MOCK_USERS.companies : MOCK_USERS.candidates;
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      login(user);
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
          <Input
            label="Adresse email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            placeholder={isCompany ? 'entreprise@example.com' : 'candidat@example.com'}
          />

          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Votre mot de passe sécurisé"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <PrimaryButton onClick={handleLogin} fullWidth>
            Se connecter
          </PrimaryButton>
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

// DASHBOARD SIMPLE
const Dashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Meritium - Dashboard</h1>
          <div className="flex items-center gap-4">
            <span>{user.name}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            Bienvenue {user.role === 'candidate' ? 'Candidat' : 'Entreprise'}
          </h2>
          <p className="text-gray-600">
            Tableau de bord en cours de développement...
          </p>
        </div>
      </div>
    </div>
  );
};

// APP PRINCIPAL
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <AuthProvider>
      <AppContent currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </AuthProvider>
  );
};

const AppContent = ({ currentPage, setCurrentPage }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      setCurrentPage('dashboard');
    }
  }, [user, loading, setCurrentPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de Meritium...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    if (user && currentPage !== 'home') return <Dashboard />;

    switch (currentPage) {
      case 'login-company':
        return <LoginPage type="company" onNavigate={setCurrentPage} />;
      case 'login-candidate':
        return <LoginPage type="candidate" onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return renderPage();
};

export default App;
