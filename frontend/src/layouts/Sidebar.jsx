import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  BookMarked,
  History,
  Sparkles,
  Heart,
  Bell,
  User,
  BookCopy,
  Users,
  Clock,
  ArrowLeftRight,
  AlertCircle,
  BarChart3,
  ShieldCheck,
  UserPlus,
  Settings,
  Library
} from 'lucide-react';

export const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  if (!user) return null;

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/browse', label: 'Browse Books', icon: BookOpen },
    { to: '/student/my-books', label: 'My Borrowed Books', icon: BookMarked },
    { to: '/student/history', label: 'Borrowing History', icon: History },
    { to: '/student/recommendations', label: 'AI Recommendations', icon: Sparkles, badge: 'AI' },
    { to: '/student/wishlist', label: 'Wishlist', icon: Heart },
    { to: '/student/notifications', label: 'Notifications', icon: Bell },
    { to: '/student/profile', label: 'My Profile', icon: User },
  ];

  const librarianLinks = [
    { to: '/librarian/dashboard', label: 'Librarian Dashboard', icon: LayoutDashboard },
    { to: '/librarian/books', label: 'Manage Books', icon: BookCopy },
    { to: '/librarian/students', label: 'Manage Students', icon: Users },
    { to: '/librarian/requests', label: 'Borrowing Requests', icon: Clock },
    { to: '/librarian/desk', label: 'Issue & Return Desk', icon: ArrowLeftRight },
    { to: '/librarian/fines', label: 'Overdue & Fines', icon: AlertCircle },
    { to: '/librarian/reports', label: 'Library Reports', icon: BarChart3 },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: ShieldCheck },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/librarians', label: 'Librarian Accounts', icon: UserPlus },
    { to: '/admin/settings', label: 'System Settings', icon: Settings },
    { to: '/librarian/books', label: 'Book Inventory', icon: Library },
  ];

  let links = studentLinks;
  if (user.role === 'LIBRARIAN') links = librarianLinks;
  if (user.role === 'ADMIN') links = adminLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 left-0 bottom-0 z-30 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full py-4 px-3 overflow-y-auto">
          
          {/* User mini banner */}
          <div className="mb-4 px-3 py-3 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-indigo-100/60">
            <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Signed in as</p>
            <p className="font-extrabold text-sm text-slate-900 truncate">{user.fullName}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[11px] font-semibold text-indigo-700 capitalize">
                {user.role?.toLowerCase()} Portal
              </span>
            </div>
          </div>

          <div className="px-3 mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Navigation</span>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-950 uppercase tracking-wider shadow-xs">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Info Box */}
          <div className="mt-auto pt-4 px-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <p className="text-[11px] font-medium text-slate-500">AI Recommendation Engine</p>
              <div className="inline-flex items-center gap-1.5 mt-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active & Online
              </div>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
};
