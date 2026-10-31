import React, { useState, useEffect } from 'react';
import { authApi, recommendationApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Shield, Sparkles, Check, CheckCircle2 } from 'lucide-react';

const GENRES = [
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Computer Science',
  'Software Engineering',
  'Mathematics',
  'Science Fiction',
  'Business & Management'
];

export const StudentProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [favoriteAuthors, setFavoriteAuthors] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await authApi.getMe();
      setProfile(res.data);
      if (res.data?.preferredGenres) {
        setSelectedGenres(res.data.preferredGenres.split(',').map((g) => g.trim()).filter(Boolean));
      }
      setFavoriteAuthors(res.data?.favoriteAuthors || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await recommendationApi.updatePreferences({
        preferredGenres: selectedGenres.join(', '),
        favoriteAuthors: favoriteAuthors.trim()
      });
      setSuccess(true);
      await refreshUser();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err?.message || err || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Student Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your account details and personalize AI book recommendation parameters.
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile and AI preferences saved successfully!</span>
        </div>
      )}

      {/* Account Info Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-indigo-200">
            {profile?.fullName?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{profile?.fullName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 uppercase tracking-wider">
                {profile?.role}
              </span>
              <span className="text-xs text-slate-400">
                Registered {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Active'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Email</span>
              <p className="font-semibold text-slate-800">{profile?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Phone</span>
              <p className="font-semibold text-slate-800">{profile?.phone || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Active Loans</span>
            <p className="text-2xl font-extrabold text-indigo-700 mt-1">{profile?.activeLoansCount || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Fines</span>
            <p className="text-2xl font-extrabold text-amber-700 mt-1">₹{profile?.pendingFinesAmount || 0}</p>
          </div>
        </div>
      </div>

      {/* AI Preferences Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-base">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Recommendation Interests</span>
          </div>
          <p className="text-xs text-slate-500">
            Select the subjects you're currently studying to tailor book suggestions.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">Preferred Genres</label>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => {
              const selected = selectedGenres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                    selected
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {selected && <Check className="w-3 h-3" />}
                  {genre}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">Favorite Authors</label>
          <input
            type="text"
            value={favoriteAuthors}
            onChange={(e) => setFavoriteAuthors(e.target.value)}
            placeholder="e.g. Stuart Russell, Ian Goodfellow, Robert Martin"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Preferences'}
          </button>
        </div>
      </form>

    </div>
  );
};
