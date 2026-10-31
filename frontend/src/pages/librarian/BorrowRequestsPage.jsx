import React, { useState, useEffect } from 'react';
import { borrowApi } from '../../services/api';
import { Clock, Check, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export const BorrowRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await borrowApi.getRequests();
      setRequests(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, title, student) => {
    setActionLoading(id);
    try {
      await borrowApi.approve(id, { notes: 'Approved by librarian' });
      setFeedback(`Approved request for "${title}" by ${student}. Book can now be physically issued.`);
      loadRequests();
    } catch (e) {
      alert(e?.message || e || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id, title, student) => {
    const reason = window.prompt(`Enter rejection note for "${title}":`, 'Limit exceeded or reserved volume');
    if (reason === null) return;
    setActionLoading(id);
    try {
      await borrowApi.reject(id, { notes: reason });
      setFeedback(`Rejected request for "${title}".`);
      loadRequests();
    } catch (e) {
      alert(e?.message || e || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 py-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Borrowing Requests Queue</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Review, approve, or reject student requests submitted via the portal.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback('')} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Queue is Clear</h3>
            <p className="text-xs text-slate-400">There are no pending requests requiring librarian review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Requested Book</th>
                  <th className="py-3 px-4">Request Date</th>
                  <th className="py-3 px-4">Student Note</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{r.userName}</p>
                      <p className="text-[11px] text-slate-400">{r.userEmail}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.bookCoverImageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"}
                          alt={r.bookTitle}
                          className="w-10 h-14 object-cover rounded-lg shadow-2xs shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-xs">{r.bookTitle}</p>
                          <p className="text-[11px] text-slate-500">by {r.bookAuthor}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {new Date(r.requestDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-slate-500 italic max-w-xs truncate">
                      {r.notes || 'No note provided'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(r.id, r.bookTitle, r.userName)}
                          disabled={actionLoading === r.id}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(r.id, r.bookTitle, r.userName)}
                          disabled={actionLoading === r.id}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs inline-flex items-center gap-1 transition-colors"
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
      </div>

    </div>
  );
};
