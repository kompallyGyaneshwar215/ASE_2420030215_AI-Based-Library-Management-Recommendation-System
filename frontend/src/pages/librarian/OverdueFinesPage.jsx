import React, { useState, useEffect } from 'react';
import { fineApi, borrowApi } from '../../services/api';
import { IndianRupee, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

export const OverdueFinesPage = () => {
  const [fines, setFines] = useState([]);
  const [overdueRecords, setOverdueRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('FINES'); // 'FINES' | 'OVERDUE'
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'FINES') {
        const res = await fineApi.getAll();
        setFines(res.data || []);
      } else {
        const res = await borrowApi.getOverdue();
        setOverdueRecords(res.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePayFine = async (fineId, amount, student) => {
    setPayLoading(fineId);
    try {
      await fineApi.payFine(fineId);
      setFeedback(`Payment of ₹${amount} received from ${student}. Marked as PAID.`);
      loadData();
    } catch (e) {
      alert(e?.message || e || 'Payment recording failed');
    } finally {
      setPayLoading(null);
    }
  };

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Overdue Books & Fine Management</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor late book returns, assess overdue fees (₹5/day), and record cash/digital payments.
          </p>
        </div>

        <div className="flex p-1 bg-slate-200/70 rounded-2xl">
          <button
            onClick={() => setActiveTab('FINES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'FINES' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fines Register
          </button>
          <button
            onClick={() => setActiveTab('OVERDUE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'OVERDUE' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overdue Loans ({overdueRecords.length})
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Table Content */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : activeTab === 'FINES' ? (
          fines.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-xs">No fines on record.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Book Title</th>
                    <th className="py-3 px-4">Fine Amount</th>
                    <th className="py-3 px-4">Generated Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fines.map((f) => {
                    const isPaid = f.paymentStatus === 'PAID';
                    return (
                      <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{f.userName}</p>
                          <p className="text-[11px] text-slate-400">{f.userEmail}</p>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 truncate max-w-xs">{f.bookTitle}</td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900">₹{f.fineAmount}</td>
                        <td className="py-3.5 px-4 text-slate-600">{new Date(f.createdAt).toLocaleDateString()}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {f.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {!isPaid ? (
                            <button
                              onClick={() => handlePayFine(f.id, f.fineAmount, f.userName)}
                              disabled={payLoading === f.id}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-2xs transition-colors"
                            >
                              <IndianRupee className="w-3.5 h-3.5" />
                              {payLoading === f.id ? 'Processing...' : 'Collect Fine'}
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Paid</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          overdueRecords.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-xs">No overdue loans currently!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Book Title</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Days Overdue</th>
                    <th className="py-3 px-4 text-right">Accrued Fine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overdueRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{r.userName}</p>
                        <p className="text-[11px] text-slate-400">{r.userEmail}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{r.bookTitle}</td>
                      <td className="py-3.5 px-4 text-slate-600">{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : 'N/A'}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold">
                          {r.daysOverdue || 1} days late
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                        ₹{(r.daysOverdue || 1) * 5.0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

    </div>
  );
};
