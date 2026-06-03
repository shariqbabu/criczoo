import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import { useTeams } from '@/hooks/useTeamPlayer';
import { useTournaments } from '@/hooks/useMatch';
import { matchService } from '@/services/matchService';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateMatchPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { teams } = useTeams();
  const { tournaments } = useTournaments();

  const [form, setForm] = useState({
    team1Id: '',
    team2Id: '',
    overs: '20',
    format: 'T20',
    venue: '',
    date: '',
    tournamentId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.team1Id === form.team2Id) {
      setError('Please select different teams.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const team1 = teams.find(t => t.id === form.team1Id);
      const team2 = teams.find(t => t.id === form.team2Id);
      await matchService.createMatch({
        ...form,
        overs: Number(form.overs),
        team1Name: team1?.name || '',
        team2Name: team2?.name || '',
        hostId: user!.uid,
        status: 'upcoming',
      });
      navigate('/host/matches');
    } catch (err: any) {
      setError(err.message || 'Failed to create match.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/host/matches" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Matches
        </Link>
        <h1 className="text-2xl font-bold mb-8">Create Match</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 space-y-5">
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Team 1 *</label>
              <select name="team1Id" value={form.team1Id} onChange={handleChange} required className="w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm">
                <option value="">Select team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Team 2 *</label>
              <select name="team2Id" value={form.team2Id} onChange={handleChange} required className="w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm">
                <option value="">Select team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Format</label>
              <select name="format" value={form.format} onChange={handleChange} className="w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm">
                <option>T20</option>
                <option>ODI</option>
                <option>Test</option>
                <option>T10</option>
                <option>Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Overs *</label>
              <input type="number" name="overs" value={form.overs} onChange={handleChange} min="1" max="50" required className="w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Venue</label>
            <input type="text" name="venue" value={form.venue} onChange={handleChange} placeholder="Ground name, City" className="w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Date & Time</label>
            <input type="datetime-local" name="date" value={form.date} onChange={handleChange} className="w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Tournament (optional)</label>
            <select name="tournamentId" value={form.tournamentId} onChange={handleChange} className="w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm">
              <option value="">No tournament</option>
              {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Create Match</>}
          </button>
        </form>
      </div>
    </Layout>
  );
}
