import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookApi, recommendationApi } from '../../services/api';
import { BookCard } from '../../components/BookCard';
import { 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  Search, 
  CheckCircle,
  Clock,
  Layers,
  GraduationCap
} from 'lucide-react';

export const LandingPage = () => {
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedBooks();
  }, []);

  const loadFeaturedBooks = async () => {
    try {
      const res = await recommendationApi.getPopular(4);
      setPopularBooks(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-16 py-4">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Next-Generation Academic Library Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            AI-Powered Library Management & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-indigo-200 to-purple-200">Smart Recommendations</span>
          </h1>

          <p className="text-base sm:text-lg text-indigo-100 font-normal leading-relaxed max-w-2xl">
            Streamlining campus book circulation, real-time availability tracking, due-date forecasting, and personalized machine-learning book recommendations powered by TF-IDF & Cosine Similarity.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/catalog"
              className="px-6 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/40 inline-flex items-center gap-2 transition-all hover:scale-105"
            >
              <BookOpen className="w-4 h-4" />
              Explore Book Catalog
            </Link>

            <Link
              to="/login"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-md border border-white/20 inline-flex items-center gap-2 transition-all"
            >
              Sign In to Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10 max-w-lg">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
              <p className="text-xs text-indigo-200 font-medium">Digital Workflow</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">&lt;50ms</p>
              <p className="text-xs text-indigo-200 font-medium">Cosine ML Scoring</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">Role-Based</p>
              <p className="text-xs text-indigo-200 font-medium">JWT Secure Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured AI Recommendations Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" /> Trending Books
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Most Borrowed Across Campus
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Popular books recommended by our real-time circulation ranking engine.
            </p>
          </div>

          <Link
            to="/catalog"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 transition-colors"
          >
            Browse all books <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-slate-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularBooks.map((book) => (
              <BookCard key={book.id || book.bookId} book={book} isRecommendation={true} />
            ))}
          </div>
        )}
      </section>

      {/* Features Overview */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Enterprise Architecture</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered for Modern Libraries
          </h2>
          <p className="text-sm text-slate-500">
            A unified academic platform combining automated library administration with machine learning recommendation algorithms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">AI Recommendation Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              TF-IDF text vectorization and cosine similarity match reading history and chosen genres to calculate match scores and explain reasons.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Automated Circulation & Fines</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              End-to-end request lifecycle: Borrow requests, librarian approvals, stock deduction, return inspections, and automatic fine calculation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Role-Based Portals</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tailored workspaces for Students, Librarians, and System Administrators with Recharts visualization and JWT token security.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
