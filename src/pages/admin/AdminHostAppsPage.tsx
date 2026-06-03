import { useEffect, useState } from 'react';
import { Layout } from '@/components/common/Layout';
import { queryDocs } from '@/lib/firestore';
import { orderBy } from 'firebase/firestore';
import { Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import { updateDocById } from '@/lib/firestore';
import type { HostApplication } from '@/types';

export default function AdminHostAppsPage() {
  const [apps, setApps] = useState<HostApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = () => {
    queryDocs<HostApplication>('hostApplications', [orderBy('createdAt', 'desc')])
      .then(setApps)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setUpdating(id);
    await updateDocById('hostApplications', id, { status, updatedAt: new Date() });
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    setUpdating(null);
  };

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  const statusIcon = (s: string) =>
    s === 'approved' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
    s === 'rejected' ? <XCircle className="w-4 h-4 text-red-500" /> :
    <Clock className="w-4 h-4 text-yellow-500" />;

  const statusColor = (s: string) =>
    s === 'approved' ? 'bg-green-100 text-green-700' :
    s === 'rejected' ? 'bg-red-100 text-red-600' :
    'bg-yellow-100 text-yellow-700';

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Host Applications</h1>
          <div className="flex gap-2">
            {(['all','pending','approved','rejected'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  filter === f ? 'bg-primary text-white' : 'border border-border hover:bg-muted'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="shimmer h-28 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No {filter} applications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(app => (
              <div key={app.id} className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{app.organizationName}</h3>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(app.status)}`}>
                        {statusIcon(app.status)} {app.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {app.userName} · {app.userEmail}
                    </p>
                    <p className="text-sm text-muted-foreground">{app.city}, {app.state} · {app.phone}</p>
                    {app.description && (
                      <p className="text-sm mt-2 text-foreground/80 line-clamp-2">{app.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {app.status === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleAction(app.id, 'approved')} disabled={updating === app.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50">
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button onClick={() => handleAction(app.id, 'rejected')} disabled={updating === app.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
