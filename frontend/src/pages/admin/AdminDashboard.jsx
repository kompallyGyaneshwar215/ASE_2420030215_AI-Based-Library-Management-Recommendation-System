import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  ShieldCheck, 
  Users, 
  BookCopy, 
  ArrowLeftRight, 
  AlertCircle, 
  IndianRupee, 
  UserCheck 
} from 'lucide-react';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'];

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await dashboardApi.getAdmin();
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const userDist = data?.userDistribution || [];
  const trends = data?.borrowingTrends || [];
  const recentTx = data?.recentTransactions || [];

  return (
    <div className="space-y-8 py-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">System Administration</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Global analytics, user roles oversight, circulation audit trails, and configuration policies.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Users"
          value={data?.totalRegisteredUsers || 0}
          icon={Users}
          color="indigo"
          subtitle={`${data?.totalStudents || 0} Students`}
        />
        <StatCard
          title="Librarians"
          value={data?.totalLibrarians || 0}
          icon={UserCheck}
          color="amber"
          subtitle="Staff accounts"
        />
        <StatCard
          title="Catalog Titles"
          value={data?.totalBooks || 0}
          icon={BookCopy}
          color="blue"
          subtitle="Indexed books"
        />
        <StatCard
          title="Circulation"
          value={data?.totalTransactions || 0}
          icon={ArrowLeftRight}
          color="purple"
          subtitle="Total transactions"
        />
        <StatCard
          title="Overdue Count"
          value={data?.overdueTransactions || 0}
          icon={AlertCircle}
          color="rose"
          subtitle="Requires attention"
        />
        <StatCard
          title="Fines Collected"
          value={`₹${data?.totalFinesCollected || 0}`}
          icon={IndianRupee}
          color="emerald"
          subtitle={`₹${data?.totalFinesPending || 0} pending`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Distribution Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">User Demographics</h3>
            <p className="text-xs text-slate-500">Distribution by security role</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userDist}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {userDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Borrowing Trends Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">Circulation Growth</h3>
            <p className="text-xs text-slate-500">Monthly student loan frequency</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" name="Circulation" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* System Transactions Audit Trail */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Recent System Transactions</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Book Title</th>
                <th className="py-3 px-4">Request Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{tx.userName}</p>
                    <p className="text-[11px] text-slate-400">{tx.userEmail}</p>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 truncate max-w-xs">{tx.bookTitle}</td>
                  <td className="py-3.5 px-4 text-slate-600">{new Date(tx.requestDate).toLocaleDateString()}</td>
                  <td className="py-3.5 px-4 text-slate-600">{tx.dueDate ? new Date(tx.dueDate).toLocaleDateString() : '-'}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
