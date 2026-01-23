import React, { useState } from 'react';
import { Edit2, Save, X, Plus, Briefcase, GraduationCap, Calendar, Shield } from 'lucide-react';

// STORAGE FUNCTIONS
const getProfilesFromStorage = () => {
  const stored = localStorage.getItem('meritium_profiles');
  if (stored) return JSON.parse(stored);
  return [];
};

const saveProfilesToStorage = (profiles) => {
  localStorage.setItem('meritium_profiles', JSON.stringify(profiles));
};

const getProfileByUserId = (userId) => {
  const profiles = getProfilesFromStorage();
  return profiles.find(p => p.userId === userId);
};

const saveProfile = (userId, profileData) => {
  const profiles = getProfilesFromStorage();
  const existingIndex = profiles.findIndex(p => p.userId === userId);
  
  if (existingIndex >= 0) {
    profiles[existingIndex] = { ...profiles[existingIndex], ...profileData, userId };
  } else {
    profiles.push({ id: Date.now(), userId, ...profileData, isActive: true });
  }
  
  saveProfilesToStorage(profiles);
};

const CandidateDashboard = ({ user }) => {
  const [profile, setProfile] = useState(() => getProfileByUserId(user.id) || {
    skills: [],
    experience: '',
    education: '',
    availability: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const addSkill = () => {
    if (newSkill.trim() && profile.skills.length < 15) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setProfile({ ...profile, skills: profile.skills.filter((_, i) => i !== index) });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      saveProfile(user.id, profile);
      setIsSaving(false);
      setIsEditing(false);
    }, 500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Mon Profil de Compétences
            </h2>
            <p className="text-gray-600">Créez un profil qui met en valeur vos talents</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 flex items-center gap-2 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Modifier
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          )}
        </div>

        {/* Skills Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <label className="text-lg font-semibold text-gray-800">
              Compétences techniques et transversales
            </label>
          </div>
          
          {isEditing && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                placeholder="Ex: React, Leadership, Gestion de projet..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={addSkill}
                disabled={profile.skills.length >= 15 || !newSkill.trim()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Ajouter
              </button>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {profile.skills.length > 0 ? (
              profile.skills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(i)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </span>
              ))
            ) : (
              <p className="text-gray-400 italic">Aucune compétence ajoutée</p>
            )}
          </div>
          {isEditing && (
            <p className="text-xs text-gray-500 mt-2">
              {profile.skills.length}/15 compétences ajoutées
            </p>
          )}
        </div>

        {/* Experience Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <label className="text-lg font-semibold text-gray-800">
              Parcours professionnel
            </label>
          </div>
          {isEditing ? (
            <textarea
              value={profile.experience}
              onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
              rows={5}
              placeholder="Décrivez votre expérience professionnelle, vos réalisations marquantes et votre expertise. Concentrez-vous sur vos accomplissements concrets et vos domaines de spécialisation."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          ) : (
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
              {profile.experience || <span className="text-gray-400 italic">Non renseigné</span>}
            </p>
          )}
        </div>

        {/* Education Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <label className="text-lg font-semibold text-gray-800">
              Formation et certifications
            </label>
          </div>
          {isEditing ? (
            <textarea
              value={profile.education}
              onChange={(e) => setProfile({ ...profile, education: e.target.value })}
              rows={4}
              placeholder="Niveau d'études, domaines de formation, certifications professionnelles et formations continues pertinentes."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          ) : (
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
              {profile.education || <span className="text-gray-400 italic">Non renseigné</span>}
            </p>
          )}
        </div>

        {/* Availability Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <label className="text-lg font-semibold text-gray-800">
              Disponibilité
            </label>
          </div>
          {isEditing ? (
            <input
              type="text"
              value={profile.availability}
              onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
              placeholder="Ex: Immédiatement, Dans 1 mois, Selon préavis..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
              {profile.availability || <span className="text-gray-400 italic">Non renseigné</span>}
            </p>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">
                Protection de votre identité
              </h4>
              <p className="text-sm text-green-800 leading-relaxed">
                Votre nom, photo, âge, genre, origine et toute donnée personnelle identifiante restent strictement confidentiels. Les recruteurs n'accèdent qu'à vos compétences et qualifications. Vous gardez le contrôle total sur la révélation de votre identité.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
