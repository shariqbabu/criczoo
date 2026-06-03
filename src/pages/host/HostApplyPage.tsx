import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/common/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { createDoc } from '@/lib/firestore';
import { Shield, CheckCircle } from 'lucide-react';

export default function HostApplyPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    organizationName: '', description: '', phone: '', city: '', state: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await createDoc('hostApplications', {
        ...form,
        userId: user!.uid,
        userName: profile?.name || '',
        userEmail: user!.email || '',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  if (submitted) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Application Submitted!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            We'll review your application and get back to you within 2–3 business days.
          </p>
          <button onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Go Home
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Become a Host</h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-md mx-auto">
            Apply to host cricket tournaments, manage teams, and score live matches on our platform.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Create Matches', desc: 'Organize & score live' },
            { label: 'Manage Teams', desc: 'Build your roster' },
            { label: 'Tournaments', desc: 'Run full events' },
          ].map(b => (
            <div key={b.label} className="bg-white border border-border rounded-xl p-4 text-center">
              <p className="font-semibold text-sm">{b.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{b.desc}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-5">
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-1.5">Organization / Club Name *</label>
            <input name="organizationName" value={form.organizationName} onChange={handleChange} required
              className={inputCls} placeholder="e.g. Mumbai Cricket Club" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Phone Number *</label>
            <input name="phone" value={form.phone} onChange={handleChange} required type="tel"
              className={inputCls} placeholder="+91 98765 43210" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">City *</label>
              <input name="city" value={form.city} onChange={handleChange} required
                className={inputCls} placeholder="e.g. Mumbai" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">State *</label>
              <input name="state" value={form.state} onChange={handleChange} required
                className={inputCls} placeholder="e.g. Maharashtra" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Why do you want to host? *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
              className={`${inputCls} resize-none`}
              placeholder="Tell us about your experience organizing cricket events..." />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
