import React, { createContext, useContext, useState, useEffect } from 'react';
import { MessageSquare, LogOut } from 'lucide-react';

// Import des pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CandidateDashboard from './pages/CandidateDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import MessagingPage from './pages/MessagingPage';

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

// NAVBAR COMPONENT
const Navbar = ({ user, onLogout, currentView, setCurrentView }) => (
  <nav className="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Meritium</h1>
        
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          <span className="text-indigo-100 text-sm sm:text-base">{user.name}</span>
          
          <button
            onClick={() => setCurrentView('profile')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
              currentView === 'profile' ? 'bg-indigo-700' : 'bg-indigo-700/50 hover:bg-indigo-700'
            }`}
          >
            {user.role === 'candidate' ? '📝 Mon Profil' : '👥 Talents'}
          </button>
          
          <button
            onClick={() => setCurrentView('messaging')}
            className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base ${
              currentView === 'messaging' ? 'bg-indigo-700' : 'bg-indigo-700/50 hover:bg-indigo-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Messages</span>
          </button>
          
          <button
            onClick={onLogout}
            className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 text-sm sm:text-base"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
);

// DASHBOARD WRAPPER
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('profile');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        user={user} 
        onLogout={logout} 
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <div className="py-0">
        {currentView === 'messaging' ? (
          <MessagingPage user={user} />
        ) : user.role === 'candidate' ? (
          <CandidateDashboard user={user} />
        ) : (
          <CompanyDashboard user={user} />
        )}
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
  const { user, login, loading } = useAuth();

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
        return <LoginPage type="company" onNavigate={setCurrentPage} onLogin={login} />;
      case 'login-candidate':
        return <LoginPage type="candidate" onNavigate={setCurrentPage} onLogin={login} />;
      case 'signup':
        return <SignupPage onNavigate={setCurrentPage} onLogin={login} />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return renderPage();
};

export default App;
