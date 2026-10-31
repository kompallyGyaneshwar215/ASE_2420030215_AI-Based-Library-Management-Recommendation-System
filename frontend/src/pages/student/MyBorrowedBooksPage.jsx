import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { borrowApi } from '../../services/api';
import { BookMarked, Calendar, AlertCircle, Clock, RotateCcw, CheckCircle2 } from 'lucide-react';

export const MyBorrowedBooksPage = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnLoading, setReturnLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadMyBooks();
  }, []);

  const loadMyBooks = async () => {
    try {
      const res = await borrowApi.getMyBooks();
      setLoans(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (id, title) => {
    setReturnLoading(id);
    setSuccessMsg('');
    try {
      await borrowApi.returnBook(id, { notes: 'Returned by student via portal' });
      setSuccessMsg(`Successfully returned "${title}".`);
      await loadMyBooks();
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

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Borrowed Books</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Keep track of active loans, due dates, and return books back to the library.
          </p>
        </div>
        <Link
          to="/student/history"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 self-start sm:self-auto"
        >
          View Full Borrowing History →
        </Link>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loans.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
          <BookMarked className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">You currently have no borrowed books</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You can borrow up to your limit. Browse the catalog to request new volumes.
          </p>
          <div className="pt-2">
            <Link
              to="/student/browse"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-200 inline-block"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loans.map((loan) => {
            const isOverdue = loan.status === 'OVERDUE' || (loan.daysOverdue && loan.daysOverdue > 0);
            return (
              <div
                key={loan.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="flex gap-4">
                  <img
                    src={loan.bookCoverImageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"}
                    alt={loan.bookTitle}
                    className="w-20 h-28 object-cover rounded-xl shadow-xs shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {loan.bookGenre || 'Textbook'}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2" title={loan.bookTitle}>
                      {loan.bookTitle}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">by {loan.bookAuthor}</p>

                    <div className="pt-1 flex flex-wrap gap-2 items-center text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Issued: {loan.issueDate ? new Date(loan.issueDate).toLocaleDateString() : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Due Date & Return Action Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className={`text-xs font-bold inline-flex items-center gap-1 px-2.5 py-1 rounded-xl ${
                      isOverdue
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {isOverdue ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          Overdue ({loan.daysOverdue} days)
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Due: {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'N/A'}
                        </>
                      )}
                    </span>
                    {loan.fineAmount > 0 && (
                      <p className="text-[11px] font-bold text-rose-600 mt-1">
                        Accumulated Fine: ₹{loan.fineAmount}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleReturn(loan.id, loan.bookTitle)}
                    disabled={returnLoading === loan.id}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {returnLoading === loan.id ? 'Returning...' : 'Return Book'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
