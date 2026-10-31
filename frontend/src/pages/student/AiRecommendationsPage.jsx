import React, { useState, useEffect } from 'react';
import { recommendationApi } from '../../services/api';
import { BookCard } from '../../components/BookCard';
import { Sparkles, SlidersHorizontal, Check, RefreshCw, Cpu, Brain, CheckCircle2 } from 'lucide-react';

const ALL_GENRES = [
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Computer Science',
  'Software Engineering',
  'Mathematics',
  'Science Fiction',
  'Business & Management'
];

export const AiRecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [popularRecommendations, setPopularRecommendations] = useState([]);
  const [preferences, setPreferences] = useState({ preferredGenres: '', favoriteAuthors: '' });
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [favoriteAuthors, setFavoriteAuthors] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      // 1. Load preferences
      const prefRes = await recommendationApi.getPreferences();
      if (prefRes.data) {
        setPreferences(prefRes.data);
        const genres = prefRes.data.preferredGenres
          ? prefRes.data.preferredGenres.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
        setSelectedGenres(genres);
        setFavoriteAuthors(prefRes.data.favoriteAuthors || '');
      }

      // 2. Load personalized recommendations
      const recRes = await recommendationApi.getMyRecommendations(8);
      setRecommendations(recRes.data || []);

      // 3. Load popular
      const popRes = await recommendationApi.getPopular(4);
      setPopularRecommendations(popRes.data || []);
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

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    setSaveSuccess(false);

    try {
      await recommendationApi.updatePreferences({
        preferredGenres: selectedGenres.join(', '),
        favoriteAuthors: favoriteAuthors.trim()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      // Reload recommendations with newly saved preferences
      const recRes = await recommendationApi.getMyRecommendations(8);
      setRecommendations(recRes.data || []);
    } catch (err) {
      alert(err?.message || err || 'Failed to update preferences');
    } finally {
      setSavingPrefs(false);
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
    <div className="space-y-8 py-2">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-amber-300">
            <Brain className="w-4 h-4" />
            <span>Machine Learning Recommendation Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Personalized AI Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-normal">
            Our recommendation algorithm builds a TF-IDF vector space representing your borrowing history and curriculum interests, calculating cosine similarity scores in real time.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs shadow-sm hover:bg-indigo-50 transition-all inline-flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showConfig ? 'Hide Preferences' : 'Tune Reading Interests'}
            </button>

            <button
              onClick={loadAll}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Feed
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Drawer / Config Panel */}
      {showConfig && (
        <form onSubmit={handleSavePreferences} className="bg-white p-6 sm:p-8 rounded-3xl border border-indigo-200/80 shadow-md space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Your AI Preference Profile</h3>
              <p className="text-xs text-slate-500">Update your favorite genres and authors to guide the model.</p>
            </div>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5" /> Profile Updated
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Preferred Academic Disciplines</label>
            <div className="flex flex-wrap gap-2">
              {ALL_GENRES.map((genre) => {
                const selected = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                      selected
                        ? 'bg-indigo-600 text-white shadow-xs'
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

          <div className="space-y-1.5 max-w-lg">
            <label className="block text-xs font-bold text-slate-700">Favorite Authors</label>
            <input
              type="text"
              value={favoriteAuthors}
              onChange={(e) => setFavoriteAuthors(e.target.value)}
              placeholder="e.g. Stuart Russell, Peter Norvig, Robert Martin"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowConfig(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={savingPrefs}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs disabled:opacity-50"
            >
              {savingPrefs ? 'Updating Model...' : 'Save & Retrain Recommendations'}
            </button>
          </div>
        </form>
      )}

      {/* Primary Personalized Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Top Matches For Your Reading History
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold">{recommendations.length} Recommendations</span>
        </div>

        {recommendations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
            <Cpu className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No matching recommendations found</p>
            <p className="text-xs text-slate-400">Select preferred genres above to generate instant recommendations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((book) => (
              <BookCard
                key={book.id || book.bookId}
                book={book}
                isRecommendation={true}
                onWishlistChange={loadAll}
              />
            ))}
          </div>
        )}
      </section>

      {/* Fallback Popular Books Grid */}
      {popularRecommendations.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-slate-200/80">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Trending Across All Students
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">Popular</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularRecommendations.map((book) => (
              <BookCard
                key={book.id || book.bookId}
                book={book}
                isRecommendation={true}
                onWishlistChange={loadAll}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
