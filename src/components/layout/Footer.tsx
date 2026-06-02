import { Link } from 'react-router-dom';
import { Trophy, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 py-10 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600">
                <span className="text-lg">🏏</span>
              </div>
              <span className="font-bold text-white">CricketPro</span>
            </div>
            <p className="text-sm text-gray-500">The ultimate cricket live scoring and tournament management platform.</p>
            <div className="flex gap-3">
              <a href="#" className="text-gray-500 hover:text-emerald-400 transition-colors text-sm flex items-center gap-1"><ExternalLink size={14} /> Twitter</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Platform</h4>
            <div className="space-y-2">
              <Link to="/matches" className="block text-sm text-gray-500 hover:text-emerald-400 transition-colors">Live Matches</Link>
              <Link to="/tournaments" className="block text-sm text-gray-500 hover:text-emerald-400 transition-colors">Tournaments</Link>
              <Link to="/search" className="block text-sm text-gray-500 hover:text-emerald-400 transition-colors">Search</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Hosting</h4>
            <div className="space-y-2">
              <Link to="/host/register" className="block text-sm text-gray-500 hover:text-emerald-400 transition-colors">Become a Host</Link>
              <Link to="/host" className="block text-sm text-gray-500 hover:text-emerald-400 transition-colors">Host Dashboard</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Account</h4>
            <div className="space-y-2">
              <Link to="/login" className="block text-sm text-gray-500 hover:text-emerald-400 transition-colors">Sign In</Link>
              <Link to="/register" className="block text-sm text-gray-500 hover:text-emerald-400 transition-colors">Sign Up</Link>
              <Link to="/profile" className="block text-sm text-gray-500 hover:text-emerald-400 transition-colors">Profile</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">© 2024 CricketPro. All rights reserved.</p>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Trophy size={12} className="text-emerald-500" />
            <span>Built for Cricket Enthusiasts</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
