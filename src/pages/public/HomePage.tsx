import { Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { Trophy, Radio, Users, TrendingUp, ArrowRight, Shield } from 'lucide-react';

export default function HomePage() {
  const features = [
    { icon: Radio, title: 'Live Scoring', desc: 'Follow matches ball-by-ball in real time', color: 'bg-red-100 text-red-600', link: '/live' },
    { icon: Trophy, title: 'Tournaments', desc: 'Browse and join cricket tournaments', color: 'bg-yellow-100 text-yellow-600', link: '/tournaments' },
    { icon: Users, title: 'Teams & Players', desc: 'Explore stats for teams and players', color: 'bg-blue-100 text-blue-600', link: '/teams' },
    { icon: TrendingUp, title: 'Leaderboards', desc: 'See top performers and rankings', color: 'bg-purple-100 text-purple-600', link: '/leaderboards' },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                🏏 Cricket Management Platform
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              The Ultimate <br />
              <span className="text-yellow-300">Cricket Hub</span>
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-8 max-w-xl">
              Live scoring, tournament management, team tracking — everything cricket in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/live"
                className="flex items-center gap-2 px-6 py-3 bg-white text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-colors shadow-lg"
              >
                <Radio className="w-5 h-5" />
                Watch Live
              </Link>
              <Link
                to="/tournaments"
                className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                <Trophy className="w-5 h-5" />
                Browse Tournaments
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything Cricket</h2>
            <p className="text-muted-foreground">All the tools you need to manage and follow cricket</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color, link }) => (
              <Link
                key={title}
                to={link}
                className="group bg-white rounded-2xl border border-border p-6 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{desc}</p>
                <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                  Explore <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Host CTA */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-10 md:p-16 text-white text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-green-200" />
            <h2 className="text-3xl font-bold mb-4">Organize Your Own Tournament</h2>
            <p className="text-green-100 mb-8 max-w-lg mx-auto">
              Apply to become a host and get access to powerful tools for managing matches, teams, and scoring.
            </p>
            <Link
              to="/host/apply"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-colors shadow-lg"
            >
              Become a Host <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
