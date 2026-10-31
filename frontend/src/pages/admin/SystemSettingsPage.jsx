import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Settings, Save, CheckCircle2, AlertCircle, Clock, IndianRupee, Layers } from 'lucide-react';

export const SystemSettingsPage = () => {
  const [settings, setSettings] = useState({
    loanDurationDays: 14,
    finePerDay: 5.0,
    maxBorrowLimit: 3
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await adminApi.getSettings();
      if (res.data) {
        setSettings(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback('');
    setError('');

    try {
      const res = await adminApi.updateSettings({
        loanDurationDays: parseInt(settings.loanDurationDays) || 14,
        finePerDay: parseFloat(settings.finePerDay) || 5.0,
        maxBorrowLimit: parseInt(settings.maxBorrowLimit) || 3
      });
      setSettings(res.data);
      setFeedback('Library circulation settings successfully updated!');
    } catch (err) {
      setError(err?.message || err || 'Failed to update settings');
    } finally {
      setSaving(false);
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
    <div className="space-y-6 py-2 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">System Settings & Policies</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure global borrowing rules, loan durations, and overdue fine amounts.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Loan Duration */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Standard Loan Duration (Days)</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Number of days a student may borrow a book before it is marked overdue.
          </p>
          <input
            type="number"
            min="1"
            max="90"
            required
            value={settings.loanDurationDays}
            onChange={(e) => setSettings({ ...settings, loanDurationDays: e.target.value })}
            className="w-full sm:w-48 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
          />
        </div>

        {/* Fine per Day */}
        <div className="space-y-1.5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
            <IndianRupee className="w-4 h-4 text-indigo-600" />
            <span>Overdue Fine Rate (₹ per Day)</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Automated daily late penalty calculated when a book is returned after its due date.
          </p>
          <input
            type="number"
            min="0"
            step="0.5"
            required
            value={settings.finePerDay}
            onChange={(e) => setSettings({ ...settings, finePerDay: e.target.value })}
            className="w-full sm:w-48 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
          />
        </div>

        {/* Max Borrow Limit */}
        <div className="space-y-1.5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Maximum Borrow Limit (Books per Student)</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Maximum number of concurrent active and requested books a student can hold.
          </p>
          <input
            type="number"
            min="1"
            max="15"
            required
            value={settings.maxBorrowLimit}
            onChange={(e) => setSettings({ ...settings, maxBorrowLimit: e.target.value })}
            className="w-full sm:w-48 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
          />
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Updating...' : 'Save Settings'}
          </button>
        </div>

      </form>

    </div>
  );
};
