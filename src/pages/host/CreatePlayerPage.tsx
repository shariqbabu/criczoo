import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import { useMyTeams } from '@/hooks/useTeamPlayer';
import { useAuth } from '@/contexts/AuthContext';
import { playerService } from '@/services/playerService';
import { ArrowLeft, Save } from 'lucide-react';
import type { BattingStyle, BowlingStyle, PlayerRole } from '@/types';

export default function CreatePlayerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: teams = [] } = useMyTeams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', dateOfBirth: '', battingStyle: 'Right Handed' as BattingStyle,
    bowlingStyle: '' as BowlingStyle | '', role: 'Batsman' as PlayerRole,
    jerseyNumber: '', teamId: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await playerService.createPlayer({
        ...form,
        jerseyNumber: form.jerseyNumber ? Number(form.jerseyNumber) : undefined,
        bowlingStyle: form.bowlingStyle || undefined,
        ownerId: user!.uid,
      });
      navigate('/host/players');
    } catch (err: any) {
      setError(err.message || 'Failed to create player');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/host/players" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Players
        </Link>
        <h1 className="text-2xl font-bold mb-8">Add Player</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-5">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

          <div><label className="block text-sm font-medium mb-1.5">Full Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. Virat Kohli" /></div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">Role *</label>
              <select name="role" value={form.role} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                {['Batsman','Bowler','All Rounder','Wicket Keeper'].map(r => <option key={r}>{r}</option>)}
              </select></div>

            <div><label className="block text-sm font-medium mb-1.5">Jersey #</label>
              <input name="jerseyNumber" value={form.jerseyNumber} onChange={handleChange} type="number" min="1" max="99"
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. 18" /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">Batting Style *</label>
              <select name="battingStyle" value={form.battingStyle} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option>Right Handed</option>
                <option>Left Handed</option>
              </select></div>

            <div><label className="block text-sm font-medium mb-1.5">Bowling Style</label>
              <select name="bowlingStyle" value={form.bowlingStyle} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">— None —</option>
                {['Right Arm Fast','Right Arm Medium','Right Arm Off Spin','Right Arm Leg Spin','Left Arm Fast','Left Arm Medium','Left Arm Orthodox','Left Arm Chinaman'].map(s => <option key={s}>{s}</option>)}
              </select></div>
          </div>

          <div><label className="block text-sm font-medium mb-1.5">Date of Birth</label>
            <input name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} type="date"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>

          <div><label className="block text-sm font-medium mb-1.5">Team</label>
            <select name="teamId" value={form.teamId} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">— No team —</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select></div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Add Player'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
