import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { useCreateTeam } from '@/hooks/useTeamPlayer';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateTeamPage() {
  const navigate = useNavigate();
  const createTeam = useCreateTeam();
  const [form, setForm] = useState({ name: '', shortName: '', city: '', description: '', foundedYear: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createTeam.mutateAsync({ ...form, foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined });
      navigate('/host/teams');
    } catch (err: any) {
      setError(err.message || 'Failed to create team');
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/host/teams" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Teams
        </Link>

        <h1 className="text-2xl font-bold mb-8">Create Team</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-5">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-1.5">Team Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. Mumbai Warriors" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Short Name *</label>
            <input name="shortName" value={form.shortName} onChange={handleChange} required maxLength={4}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. MUW" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">City</label>
            <input name="city" value={form.city} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. Mumbai" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Founded Year</label>
            <input name="foundedYear" value={form.foundedYear} onChange={handleChange} type="number" min="1800" max={new Date().getFullYear()}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. 2010" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Tell us about your team..." />
          </div>

          <button type="submit" disabled={createTeam.isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {createTeam.isPending ? 'Creating...' : 'Create Team'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
