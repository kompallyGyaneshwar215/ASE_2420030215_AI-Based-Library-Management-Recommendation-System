import React, { useState } from 'react';
import { borrowApi } from '../services/api';
import { X, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

export const BorrowModal = ({ book, isOpen, onClose, onSuccess }) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen || !book) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await borrowApi.request({
        bookId: book.id,
        notes: notes.trim()
      });
      setSuccess('Your borrowing request has been submitted for approval!');
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 1400);
    } catch (err) {
      setError(err?.message || err || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>Request to Borrow</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="flex gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <img
              src={book.coverImageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"}
              alt={book.title}
              className="w-16 h-22 object-cover rounded-xl shadow-xs shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-slate-900 truncate">{book.title}</h4>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">by {book.author}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                  {book.genre}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600">
                  {book.availableCopies} available
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Notes or Purpose (Optional)
            </label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Required for Final Semester Project research..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            ></textarea>
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-slate-600 space-y-1">
            <p className="font-semibold text-indigo-900">Standard Loan Policy:</p>
            <p>• 14 days duration from date of issuance.</p>
            <p>• ₹5/day overdue fine applies on late returns.</p>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || book.availableCopies <= 0}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Confirm Request'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
