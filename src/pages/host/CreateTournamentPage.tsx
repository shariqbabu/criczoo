import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { createTournament } from '@/services/tournamentService';
import { ArrowLeft, Save } from 'lucide-react';
import type { TournamentFormat, MatchFormat } from '@/types';

export default function CreateTournamentPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', format: 'league' as TournamentFormat,
    matchFormat: 'T20' as MatchFormat, totalOvers: '20',
    startDate: '', endDate: '', venue: '', city: '',
    maxTeams: '8', isPublic: true, registrationOpen: true,
    prizePool: '', entryFee: '', rules: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await createTournament({
        ...form,
        totalOvers: Number(form.totalOvers),
        maxTeams: Number(form.maxTeams),
        entryFee: form.entryFee ? Number(form.entryFee) : undefined,
        startDate: new Date(form.startDate),
        endDate: form.endDate ? new Date(form.endDate) : undefined,
        hostId: user!.uid,
        hostName: profile?.name || '',
        status: 'upcoming',
        teams: [],
        registrationOpen: form.registrationOpen,
      });
      navigate('/host/tournaments');
    } catch (err: any) {
      setError(err.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/host/tournaments" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Tournaments
        </Link>
        <h1 className="text-2xl font-bold mb-8">Create Tournament</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-5">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-1.5">Tournament Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required className={inputCls} placeholder="e.g. Summer Cup 2026" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Format *</label>
              <select name="format" value={form.format} onChange={handleChange} className={inputCls}>
                {['league','knockout','round_robin','group_stage','custom'].map(f => <option key={f} value={f}>{f.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Match Format *</label>
              <select name="matchFormat" value={form.matchFormat} onChange={handleChange} className={inputCls}>
                {['T10','T20','ODI','Test','Custom'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Total Overs *</label>
              <input name="totalOvers" value={form.totalOvers} onChange={handleChange} type="number" min="1" required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Max Teams *</label>
              <input name="maxTeams" value={form.maxTeams} onChange={handleChange} type="number" min="2" required className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Start Date *</label>
              <input name="startDate" value={form.startDate} onChange={handleChange} type="date" required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">End Date</label>
              <input name="endDate" value={form.endDate} onChange={handleChange} type="date" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Venue</label>
              <input name="venue" value={form.venue} onChange={handleChange} className={inputCls} placeholder="Ground name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">City</label>
              <input name="city" value={form.city} onChange={handleChange} className={inputCls} placeholder="e.g. Mumbai" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Prize Pool</label>
              <input name="prizePool" value={form.prizePool} onChange={handleChange} className={inputCls} placeholder="e.g. ₹50,000" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Entry Fee (₹)</label>
              <input name="entryFee" value={form.entryFee} onChange={handleChange} type="number" min="0" className={inputCls} placeholder="0" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={`${inputCls} resize-none`} placeholder="About this tournament..." />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Rules</label>
            <textarea name="rules" value={form.rules} onChange={handleChange} rows={4} className={`${inputCls} resize-none`} placeholder="Tournament rules..." />
          </div>

          <div className="flex items-center justify-between py-3 border-t border-border">
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isPublic" checked={form.isPublic} onChange={handleChange} id="isPublic" className="rounded" />
              <label htmlFor="isPublic" className="text-sm font-medium">Public Tournament</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="registrationOpen" checked={form.registrationOpen} onChange={handleChange} id="regOpen" className="rounded" />
              <label htmlFor="regOpen" className="text-sm font-medium">Open Registration</label>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create Tournament'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
