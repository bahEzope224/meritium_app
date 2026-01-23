import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, Search, Filter } from 'lucide-react';

// STORAGE FUNCTIONS
const getProfilesFromStorage = () => {
  const stored = localStorage.getItem('meritium_profiles');
  if (stored) return JSON.parse(stored);
  return [];
};

const getInterestsFromStorage = () => {
  const stored = localStorage.getItem('meritium_interests');
  return stored ? JSON.parse(stored) : [];
};

const saveInterestsToStorage = (interests) => {
  localStorage.setItem('meritium_interests', JSON.stringify(interests));
};

const toggleInterest = (companyId, profileId) => {
  const interests = getInterestsFromStorage();
  const existingIndex = interests.findIndex(
    i => i.companyId === companyId && i.profileId === profileId
  );
  
  if (existingIndex >= 0) {
    interests.splice(existingIndex, 1);
  } else {
    interests.push({
      id: Date.now(),
      companyId,
      profileId,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  }
  
  saveInterestsToStorage(interests);
  return interests;
};

const isProfileInterested = (companyId, profileId) => {
  const interests = getInterestsFromStorage();
  return interests.some(i => i.companyId === companyId && i.profileId === profileId);
};

const CompanyDashboard = ({ user }) => {
  const [profiles, setProfiles] = useState([]);
  const [interests, setInterests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('');

  useEffect(() => {
    setProfiles(getProfilesFromStorage().filter(p => p.isActive));
    setInterests(getInterestsFromStorage());
  }, []);

  const handleToggleInterest = (profileId) => {
    const updatedInterests = toggleInterest(user.id, profileId);
    setInterests(updatedInterests);
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = searchTerm === '' || 
      profile.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      profile.experience.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.education.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterSkill === '' ||
      profile.skills.some(s => s.toLowerCase().includes(filterSkill.toLowerCase()));
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Talents Disponibles
          </h2>
          <p className="text-gray-600">
            Découvrez des profils qualifiés évalués uniquement sur leurs compétences
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par compétences, expérience..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="sm:w-64 relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              placeholder="Filtrer par compétence"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          {filteredProfiles.length} profil{filteredProfiles.length > 1 ? 's' : ''} trouvé{filteredProfiles.length > 1 ? 's' : ''}
        </div>

        {/* Profiles List */}
        <div className="space-y-6">
          {filteredProfiles.length > 0 ? (
            filteredProfiles.map((profile) => {
              const interested = isProfileInterested(user.id, profile.id);
              
              return (
                <div
                  key={profile.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-indigo-200"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">
                        Profil Talent #{profile.id}
                      </h3>
                      <p className="text-sm text-gray-500">Profil vérifié et anonymisé</p>
                    </div>
                    <button
                      onClick={() => handleToggleInterest(profile.id)}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                        interested
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {interested ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Sélectionné
                        </>
                      ) : (
                        <>
                          <Award className="w-5 h-5" />
                          Marquer intéressant
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Skills */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-600" />
                        Compétences maîtrisées
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Experience */}
                    {profile.experience && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Expérience professionnelle</h4>
                        <p className="text-gray-600 leading-relaxed">{profile.experience}</p>
                      </div>
                    )}

                    {/* Education */}
                    {profile.education && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Formation</h4>
                        <p className="text-gray-600 leading-relaxed">{profile.education}</p>
                      </div>
                    )}

                    {/* Availability */}
                    {profile.availability && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-gray-700">Disponibilité:</span>
                        <span className="text-gray-600">{profile.availability}</span>
                      </div>
                    )}
                  </div>

                  {/* Interest Confirmation */}
                  {interested && (
                    <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span>
                          <strong>Contact initié.</strong> Rendez-vous dans la messagerie pour échanger avec ce talent de manière anonyme.
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-semibold">Aucun profil trouvé</p>
                <p className="text-sm mt-2">Essayez de modifier vos critères de recherche</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
