import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-xs">🏏</span>
              </div>
              <span className="text-lg font-bold text-primary">CricPro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The ultimate cricket tournament management and live scoring platform.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Matches</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/live" className="hover:text-primary transition-colors">Live Matches</Link></li>
              <li><Link to="/tournaments" className="hover:text-primary transition-colors">Tournaments</Link></li>
              <li><Link to="/leaderboards" className="hover:text-primary transition-colors">Leaderboards</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/teams" className="hover:text-primary transition-colors">Teams</Link></li>
              <li><Link to="/players" className="hover:text-primary transition-colors">Players</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/login" className="hover:text-primary transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">Register</Link></li>
              <li><Link to="/host/apply" className="hover:text-primary transition-colors">Become a Host</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CricPro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
