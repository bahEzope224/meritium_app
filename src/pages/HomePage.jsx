import React from 'react';
import { Building2, User, ArrowRight } from 'lucide-react';

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

export default HomePage;
