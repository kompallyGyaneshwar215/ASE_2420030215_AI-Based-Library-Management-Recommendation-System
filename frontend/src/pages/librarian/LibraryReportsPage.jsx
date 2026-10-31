import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../services/api';
import { BarChart3, Printer, Download, BookOpen, Users, RotateCcw, AlertCircle, IndianRupee } from 'lucide-react';

export const LibraryReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const res = await dashboardApi.getLibrarian();
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const mostBorrowed = data?.mostBorrowedBooks || [];
  const genres = data?.genreDistribution || [];

  return (
    <div className="space-y-8 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Library Analytics & Circulation Reports</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Official semester reports, borrowing velocity, and inventory statistics.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" /> Print Official Report
        </button>
      </div>

      {/* Summary KPI Block */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Inventory</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{data?.totalBooks || 0} Copies</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{data?.availableBooks || 0} Available</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Borrowers</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{data?.totalStudents || 0} Students</p>
          <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">{data?.activeBorrowings || 0} Active Loans</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Returned Books</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{data?.returnedBooks || 0}</p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Cleared circulation</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Fines Revenue</span>
          <p className="text-2xl font-extrabold text-purple-700 mt-1">₹{data?.totalFinesCollected || 0}</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">₹{data?.totalFinesPending || 0} Pending</p>
        </div>
      </div>

      {/* Most Borrowed Books Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Most Borrowed Titles</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Book Title</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Genre</th>
                <th className="py-3 px-4 text-center">Available / Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mostBorrowed.map((b, idx) => (
                <tr key={b.id} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{b.title}</td>
                  <td className="py-3.5 px-4 text-slate-600">{b.author}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[10px]">
                      {b.genre}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold">
                    {b.availableCopies} / {b.totalCopies}
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
