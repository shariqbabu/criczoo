import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Home,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  Activity,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { signOut } from '../../firebase/auth';
import { Avatar } from './Avatar';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/matches', label: 'Matches', icon: Activity },
  { to: '/tournaments', label: 'Tournaments', icon: Trophy },
];

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin, isHost } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch {
      toast.error('Sign out failed');
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-green-900/40">
                <Trophy size={16} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                Cric<span className="text-green-400">Arena</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                    location.pathname === to
                      ? 'bg-green-500/15 text-green-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {(isHost || isAdmin) && (
                    <Link
                      to="/host"
                      className={cn(
                        'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                        location.pathname.startsWith('/host')
                          ? 'bg-green-500/20 border-green-500/40 text-green-400'
                          : 'border-slate-700 text-slate-400 hover:border-green-500/30 hover:text-green-400'
                      )}
                    >
                      <BarChart3 size={13} />
                      Dashboard
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={cn(
                        'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                        location.pathname.startsWith('/admin')
                          ? 'bg-purple-500/20 border-purple-500/40 text-purple-400'
                          : 'border-slate-700 text-slate-400 hover:border-purple-500/30 hover:text-purple-400'
                      )}
                    >
                      <Shield size={13} />
                      Admin
                    </Link>
                  )}
                  <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                    <Bell size={18} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2"
                    >
                      <Avatar
                        name={user.displayName ?? user.email ?? 'User'}
                        src={user.photoURL}
                        size="sm"
                      />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 glass-card rounded-xl shadow-xl py-1 slide-in">
                        <div className="px-4 py-3 border-b border-slate-700/50">
                          <p className="text-sm font-semibold text-white truncate">
                            {user.displayName ?? 'User'}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          {profile?.role && (
                            <span className="mt-1 inline-block text-xs bg-green-500/20 text-green-400 rounded-full px-2 py-0.5 capitalize">
                              {profile.role}
                            </span>
                          )}
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                        >
                          <User size={15} /> Profile
                        </Link>
                        <button
                          onClick={() => { setDropdownOpen(false); handleSignOut(); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg shadow-green-900/30"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-800/60 px-4 py-3 space-y-1 bg-slate-900/95">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  location.pathname === to
                    ? 'bg-green-500/15 text-green-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}
            {(isHost || isAdmin) && (
              <Link
                to="/host"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <BarChart3 size={17} /> Host Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <Shield size={17} /> Admin Panel
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Overlay for dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </>
  );
};
