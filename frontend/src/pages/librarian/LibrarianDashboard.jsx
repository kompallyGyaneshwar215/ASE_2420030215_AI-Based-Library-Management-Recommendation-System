import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, borrowApi } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  BookCopy, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  IndianRupee, 
  TrendingUp, 
  Check, 
  X,
  ArrowRight
} from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];

export const LibrarianDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await dashboardApi.getLibrarian();
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await borrowApi.approve(id, { notes: 'Approved by librarian' });
      await loadDashboard();
    } catch (e) {
      alert(e?.message || e || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await borrowApi.reject(id, { notes: 'Rejected by librarian' });
      await loadDashboard();
    } catch (e) {
      alert(e?.message || e || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pendingRequests = data?.pendingRequests || [];
  const monthlyTrends = data?.monthlyBorrowings || [];
  const genreData = data?.genreDistribution || [];

  return (
    <div className="space-y-8 py-2">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Librarian Operations Center</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor library stock, approve borrowing requests, inspect circulation, and manage student overdue accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/librarian/books"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-200 transition-all inline-flex items-center gap-1.5"
          >
            <BookCopy className="w-4 h-4" /> Add / Manage Books
          </Link>
          <Link
            to="/librarian/desk"
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all"
          >
            Issue / Return Desk
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Stock"
          value={data?.totalBooks || 0}
          icon={BookCopy}
          color="indigo"
          subtitle={`${data?.availableBooks || 0} Available`}
        />
        <StatCard
          title="Students"
          value={data?.totalStudents || 0}
          icon={Users}
          color="blue"
          subtitle="Registered borrowers"
        />
        <StatCard
          title="Pending Requests"
          value={data?.pendingBorrowRequests || 0}
          icon={Clock}
          color="amber"
          subtitle="Needs review"
        />
        <StatCard
          title="Active Loans"
          value={data?.activeBorrowings || 0}
          icon={RotateCcw}
          color="purple"
          subtitle="In circulation"
        />
        <StatCard
          title="Overdue Books"
          value={data?.overdueBooks || 0}
          icon={AlertCircle}
          color="rose"
          subtitle="Late return list"
        />
        <StatCard
          title="Pending Fines"
          value={`₹${data?.totalFinesPending || 0}`}
          icon={IndianRupee}
          color="emerald"
          subtitle={`₹${data?.totalFinesCollected || 0} collected`}
        />
      </div>

      {/* Recharts Section: Borrowing Trends & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">Monthly Circulation Trend</h3>
              <p className="text-xs text-slate-500">Book loan volume over the past 6 months</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">Live Trend</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" name="Borrowings" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">Category Distribution</h3>
            <p className="text-xs text-slate-500">Book inventory by discipline</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 justify-center text-[10px] text-slate-600 font-semibold">
            {genreData.slice(0, 4).map((c, i) => (
              <span key={c.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                {c.name} ({c.value})
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Pending Borrow Requests Action Table */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              Pending Borrowing Requests ({pendingRequests.length})
            </h3>
          </div>
          <Link to="/librarian/requests" className="text-xs font-bold text-indigo-600 hover:underline">
            View All Requests →
          </Link>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="py-10 text-center space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold text-slate-700">All pending requests cleared!</p>
            <p className="text-xs text-slate-400">There are no outstanding student borrowing requests waiting for approval.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Book Requested</th>
                  <th className="py-3 px-4">Request Date</th>
                  <th className="py-3 px-4">Student Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{req.userName}</p>
                      <p className="text-[11px] text-slate-500">{req.userEmail}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 truncate max-w-xs">{req.bookTitle}</p>
                      <p className="text-[11px] text-slate-500">by {req.bookAuthor}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(req.requestDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-500 italic truncate max-w-xs">
                      {req.notes || 'None'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(req.id)}
                          disabled={actionLoading === req.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] inline-flex items-center gap-1 transition-colors shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          disabled={actionLoading === req.id}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
};
