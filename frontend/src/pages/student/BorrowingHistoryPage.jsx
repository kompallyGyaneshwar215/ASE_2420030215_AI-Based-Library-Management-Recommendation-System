import React, { useState, useEffect } from 'react';
import { borrowApi } from '../../services/api';
import { History, Calendar, CheckCircle, Clock, AlertCircle, RotateCcw } from 'lucide-react';

export const BorrowingHistoryPage = () => {
  const [records, setRecords] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await borrowApi.getHistory();
      setRecords(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RETURNED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ISSUED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'OVERDUE':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REJECTED':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const filtered = filterStatus === 'ALL'
    ? records
    : records.filter((r) => r.status === filterStatus);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Borrowing History</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Complete archive of your past and active library circulation transactions.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['ALL', 'ISSUED', 'RETURNED', 'OVERDUE', 'REQUESTED', 'APPROVED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterStatus === st
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* History Table / Cards */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
          <History className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No records found</h3>
          <p className="text-xs text-slate-400">No borrowing transactions match this status.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">Book Details</th>
                  <th className="py-4 px-4">Request Date</th>
                  <th className="py-4 px-4">Issue Date</th>
                  <th className="py-4 px-4">Due Date</th>
                  <th className="py-4 px-4">Return Date</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Fines</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.bookCoverImageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"}
                          alt={item.bookTitle}
                          className="w-10 h-14 object-cover rounded-lg shadow-2xs shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-xs">{item.bookTitle}</p>
                          <p className="text-[11px] text-slate-500 font-medium truncate">by {item.bookAuthor}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {new Date(item.requestDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {item.issueDate ? new Date(item.issueDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {item.returnDate ? new Date(item.returnDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {item.fineAmount > 0 ? (
                        <div>
                          <span className="font-bold text-rose-600">₹{item.fineAmount}</span>
                          <span className={`block text-[10px] font-semibold ${item.fineStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {item.fineStatus || 'PENDING'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium">₹0.00</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
