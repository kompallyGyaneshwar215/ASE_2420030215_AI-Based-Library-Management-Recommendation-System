import React, { useState, useEffect } from 'react';
import { borrowApi } from '../../services/api';
import { ArrowLeftRight, BookOpen, RotateCcw, Check, CheckCircle2, AlertCircle } from 'lucide-react';

export const IssueReturnDeskPage = () => {
  const [activeTab, setActiveTab] = useState('ISSUE'); // 'ISSUE' | 'RETURN'
  const [issueList, setIssueList] = useState([]);
  const [returnList, setReturnList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadDeskData();
  }, [activeTab]);

  const loadDeskData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'ISSUE') {
        // Load approved & requested items ready to be physically handed over
        const resApproved = await borrowApi.getAll('APPROVED');
        const resRequested = await borrowApi.getAll('REQUESTED');
        setIssueList([...(resApproved.data || []), ...(resRequested.data || [])]);
      } else {
        // Load active loans in circulation (ISSUED & OVERDUE)
        const resIssued = await borrowApi.getAll('ISSUED');
        const resOverdue = await borrowApi.getAll('OVERDUE');
        setReturnList([...(resIssued.data || []), ...(resOverdue.data || [])]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = async (id, title, student) => {
    setActionLoading(id);
    try {
      await borrowApi.issue(id, { notes: 'Physical book issued at circulation desk' });
      setFeedback(`Successfully issued "${title}" to ${student}. Inventory decremented and due date set.`);
      loadDeskData();
    } catch (e) {
      alert(e?.message || e || 'Failed to issue book');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturn = async (id, title, student) => {
    setActionLoading(id);
    try {
      await borrowApi.returnBook(id, { notes: 'Physical book inspected and returned at desk' });
      setFeedback(`"${title}" returned by ${student}. Inventory incremented.`);
      loadDeskData();
    } catch (e) {
      alert(e?.message || e || 'Failed to record return');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Circulation Desk</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Physical book hand-over issuance and return check-in processing.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-200/70 rounded-2xl">
          <button
            onClick={() => setActiveTab('ISSUE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ISSUE'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Issue Desk
          </button>
          <button
            onClick={() => setActiveTab('RETURN')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'RETURN'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Return Desk
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Desk Content */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : activeTab === 'ISSUE' ? (
          // Issue List
          issueList.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-xs space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-700">No books waiting to be issued</p>
              <p>Check Borrow Requests to approve incoming requests.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Book to Issue</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {issueList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{item.userName}</p>
                        <p className="text-[11px] text-slate-400">{item.userEmail}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{item.bookTitle}</p>
                        <p className="text-[11px] text-slate-500">by {item.bookAuthor}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          item.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleIssue(item.id, item.bookTitle, item.userName)}
                          disabled={actionLoading === item.id}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          {actionLoading === item.id ? 'Issuing...' : 'Issue Book'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          // Return List
          returnList.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-xs">
              No active loans currently in circulation.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Borrowed Book</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status / Fine</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {returnList.map((item) => {
                    const isOverdue = item.status === 'OVERDUE' || (item.daysOverdue && item.daysOverdue > 0);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{item.userName}</p>
                          <p className="text-[11px] text-slate-400">{item.userEmail}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{item.bookTitle}</p>
                          <p className="text-[11px] text-slate-500">by {item.bookAuthor}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4">
                          {isOverdue ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                              Overdue ({item.daysOverdue} days)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                              Active Loan
                            </span>
                          )}
                          {item.fineAmount > 0 && (
                            <span className="block text-[11px] font-bold text-rose-600 mt-0.5">
                              Fine: ₹{item.fineAmount}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleReturn(item.id, item.bookTitle, item.userName)}
                            disabled={actionLoading === item.id}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            {actionLoading === item.id ? 'Recording...' : 'Record Return'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

    </div>
  );
};
