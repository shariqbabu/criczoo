import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Bell, Sun, Moon, LogOut, User, Settings,
  ChevronDown, Trophy, Activity, Shield, Home, Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';
import { Badge } from '../ui/Badge';
import toast from 'react-hot-toast';

export function Navbar() {
  const { currentUser, userProfile, logout, isAdmin, isHost } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const { notifications, unreadCount, markAsRead } = useNotifications(currentUser?.uid || '');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home size={16} /> },
    { to: '/matches', label: 'Matches', icon: <Activity size={16} /> },
    { to: '/tournaments', label: 'Tournaments', icon: <Trophy size={16} /> },
    { to: '/search', label: 'Search', icon: <Search size={16} /> },
  ];

  if (isHost) navLinks.push({ to: '/host', label: 'Host Dashboard', icon: <Shield size={16} /> });
  if (isAdmin) navLinks.push({ to: '/admin', label: 'Admin', icon: <Settings size={16} /> });

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-gray-950/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
              <span className="text-xl">🏏</span>
            </div>
            <div>
              <span className="font-bold text-white text-lg leading-none">Cricket</span>
              <span className="font-bold text-emerald-400 text-lg leading-none">Pro</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {currentUser ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-12 w-80 rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl"
                      >
                        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
                          <h3 className="font-semibold text-white">Notifications</h3>
                          {unreadCount > 0 && (
                            <button className="text-xs text-emerald-400 hover:text-emerald-300">Mark all read</button>
                          )}
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="px-4 py-6 text-center text-sm text-gray-500">No notifications</p>
                          ) : (
                            notifications.slice(0, 10).map(n => (
                              <div
                                key={n.id}
                                onClick={() => markAsRead(n.id)}
                                className={`flex items-start gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors ${!n.read ? 'bg-emerald-500/5' : ''}`}
                              >
                                <div className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${!n.read ? 'bg-emerald-400' : 'bg-transparent'}`} />
                                <div>
                                  <p className="text-sm font-medium text-white">{n.title}</p>
                                  <p className="text-xs text-gray-400">{n.message}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-3 py-1.5 hover:bg-gray-700 transition-colors"
                  >
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt="" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500">
                        <span className="text-xs font-bold text-white">{userProfile?.name?.[0] || 'U'}</span>
                      </div>
                    )}
                    <span className="hidden sm:block text-sm text-white max-w-[100px] truncate">{userProfile?.name || 'User'}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-12 w-48 rounded-2xl border border-gray-700 bg-gray-900 py-1 shadow-2xl"
                      >
                        <div className="px-4 py-2 border-b border-gray-700">
                          <p className="text-xs text-gray-400">Signed in as</p>
                          <p className="text-sm font-medium text-white truncate">{userProfile?.email}</p>
                          <Badge variant="info" size="sm">{userProfile?.role || 'user'}</Badge>
                        </div>
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                          <User size={16} /> My Profile
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                            <Settings size={16} /> Admin Panel
                          </Link>
                        )}
                        <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                          <LogOut size={16} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-800 bg-gray-950"
          >
            <div className="space-y-1 px-4 py-3">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
