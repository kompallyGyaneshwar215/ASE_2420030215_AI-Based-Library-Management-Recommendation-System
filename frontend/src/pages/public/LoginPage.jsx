import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, LogIn, AlertCircle, Sparkles, User, ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      const role = data.role;
      const redirectPath = location.state?.from?.pathname || (
        role === 'ADMIN' ? '/admin/dashboard' :
        role === 'LIBRARIAN' ? '/librarian/dashboard' :
        '/student/dashboard'
      );
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err?.message || err || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-200">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500">
            Sign in to access library circulation and personalized AI recommendations
          </p>
        </div>

        {/* Demo Fast-Login Selector */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            One-Click Demo Credentials
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('student@library.com', 'password123')}
              className="px-2 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 text-[11px] font-bold text-slate-700 hover:text-indigo-600 shadow-2xs transition-all text-center"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('librarian@library.com', 'password123')}
              className="px-2 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-amber-500 text-[11px] font-bold text-slate-700 hover:text-amber-600 shadow-2xs transition-all text-center"
            >
              Librarian
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@library.com', 'password123')}
              className="px-2 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-purple-500 text-[11px] font-bold text-slate-700 hover:text-purple-600 shadow-2xs transition-all text-center"
            >
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@library.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <span className="text-[11px] text-slate-400">Default: password123</span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          New to the library?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:underline">
            Register for Student Account
          </Link>
        </div>

      </div>
    </div>
  );
};
