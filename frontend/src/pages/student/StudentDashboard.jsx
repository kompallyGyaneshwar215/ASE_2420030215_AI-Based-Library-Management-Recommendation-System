import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, borrowApi, fineApi } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { BookCard } from '../../components/BookCard';
import { 
  BookOpen, 
  BookMarked, 
  Clock, 
  AlertCircle, 
  IndianRupee, 
  Sparkles, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [returnLoading, setReturnLoading] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await dashboardApi.getStudent();
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (borrowId) => {
    setReturnLoading(borrowId);
    try {
      await borrowApi.returnBook(borrowId, { notes: 'Returned via Student Dashboard' });
      await loadDashboard();
    } catch (e) {
      alert(e?.message || e || 'Failed to return book');
    } finally {
      setReturnLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeBorrows = data?.activeBorrows || [];
  const recommendations = data?.recommendedBooks || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-8 py-2">
      
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-800 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Curated Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Student Dashboard</h1>
          <p className="text-xs sm:text-sm text-indigo-100">
            Track your current loans, upcoming returns, overdue fines, and smart book recommendations.
          </p>
        </div>

        <Link
          to="/student/browse"
          className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-xs shadow-sm hover:bg-indigo-50 transition-all self-start sm:self-auto shrink-0"
        >
          Browse Book Catalog
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Borrowed"
          value={data?.totalBooksBorrowed || 0}
          icon={BookOpen}
          color="indigo"
          subtitle="All-time history"
        />
        <StatCard
          title="Active Loans"
          value={data?.currentlyBorrowed || 0}
          icon={BookMarked}
          color="blue"
          subtitle="Currently reading"
        />
        <StatCard
          title="Due Soon"
          value={data?.upcomingReturns || 0}
          icon={Clock}
          color="amber"
          subtitle="Next 72 hours"
        />
        <StatCard
          title="Overdue"
          value={data?.overdueBooks || 0}
          icon={AlertCircle}
          color="rose"
          subtitle="Immediate return"
        />
        <StatCard
          title="Unpaid Fines"
          value={`₹${data?.outstandingFines || 0}`}
          icon={IndianRupee}
          color="purple"
          subtitle="Total pending"
        />
      </div>

      {/* Recommended for You (AI Spotlight) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Recommended For You
              </h2>
              <p className="text-xs text-slate-500">
                Personalized using TF-IDF text features & cosine similarity from your reading history
              </p>
            </div>
          </div>

          <Link
            to="/student/recommendations"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
          >
            All AI Recommendations <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendations.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-500">No recommendations available yet. Set your genre preferences!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.slice(0, 4).map((rec) => (
              <BookCard key={rec.id || rec.bookId} book={rec} isRecommendation={true} onWishlistChange={loadDashboard} />
            ))}
          </div>
        )}
      </section>

      {/* Currently Borrowed Books Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Currently Borrowed Books
            </h2>
          </div>
          <Link
            to="/student/my-books"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
          >
            Manage active loans <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeBorrows.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No active book loans</p>
            <p className="text-xs text-slate-400">Explore the catalog to request your next academic read.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBorrows.map((loan) => {
              const isOverdue = loan.status === 'OVERDUE' || (loan.daysOverdue && loan.daysOverdue > 0);
              return (
                <div key={loan.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex gap-4 items-center justify-between">
                  <div className="flex gap-3.5 items-center min-w-0">
                    <img
                      src={loan.bookCoverImageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"}
                      alt={loan.bookTitle}
                      className="w-14 h-20 object-cover rounded-xl shadow-2xs shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{loan.bookTitle}</h4>
                      <p className="text-[11px] text-slate-500 font-medium truncate">by {loan.bookAuthor}</p>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isOverdue ? `Overdue (${loan.daysOverdue} days)` : `Due: ${loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'N/A'}`}
                        </span>

                        {loan.fineAmount > 0 && (
                          <span className="text-[10px] font-bold text-rose-600">
                            Fine: ₹{loan.fineAmount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleReturnBook(loan.id)}
                    disabled={returnLoading === loan.id}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs shrink-0 transition-colors inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {returnLoading === loan.id ? 'Returning...' : 'Return'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Activity Timeline */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">Recent Borrowing Activity</h3>
          <Link to="/student/history" className="text-xs font-semibold text-indigo-600 hover:underline">
            View full history
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No recent activity recorded.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentActivity.map((rec) => (
              <div key={rec.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    rec.status === 'RETURNED' ? 'bg-emerald-50 text-emerald-600' :
                    rec.status === 'ISSUED' ? 'bg-indigo-50 text-indigo-600' :
                    rec.status === 'OVERDUE' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
                  }`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{rec.bookTitle}</p>
                    <p className="text-[11px] text-slate-500">
                      Requested {new Date(rec.requestDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  rec.status === 'RETURNED' ? 'bg-emerald-100 text-emerald-800' :
                  rec.status === 'ISSUED' ? 'bg-indigo-100 text-indigo-800' :
                  rec.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' :
                  rec.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {rec.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
