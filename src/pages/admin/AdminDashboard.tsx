import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Activity, Trophy, CheckCircle, XCircle, Clock, AlertTriangle, Eye, Ban } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useHostApplications } from '../../hooks/useHostApplications';
import { useMatches } from '../../hooks/useMatches';
import { useTournaments } from '../../hooks/useTournaments';
import { StatCard } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { doc, updateDoc, collection, query, getDocs, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewModal, setReviewModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<{ id: string; userId: string; name: string } | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNote, setReviewNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const { data: pendingApps, isLoading: pendingLoading, refetch: refetchApps } = useHostApplications('pending');
  const { data: allApps, isLoading: allAppsLoading } = useHostApplications();
  const { matches: liveMatches } = useMatches({ status: 'live' });
  const { data: tournaments } = useTournaments();

  if (userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Shield size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-gray-400">You need admin privileges</p>
        </div>
      </div>
    );
  }

  const openReview = (app: { id: string; userId: string; name: string }, action: 'approve' | 'reject') => {
    setSelectedApp(app);
    setReviewAction(action);
    setReviewNote('');
    setReviewModal(true);
  };

  const processReview = async () => {
    if (!selectedApp) return;
    setProcessing(true);
    try {
      const newStatus = reviewAction === 'approve' ? 'approved' : 'rejected';

      // Update application
      await updateDoc(doc(db, 'hostApplications', selectedApp.id), {
        status: newStatus,
        reviewedBy: userProfile.uid,
        reviewNote,
        updatedAt: serverTimestamp(),
      });

      // Update user role if approved
      const usersQuery = query(collection(db, 'users'), where('uid', '==', selectedApp.userId));
      const snap = await getDocs(usersQuery);
      if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, {
          role: reviewAction === 'approve' ? 'host' : 'user',
          hostStatus: newStatus,
          updatedAt: serverTimestamp(),
        });
      }

      toast.success(`Host ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully!`);
      refetchApps();
      setReviewModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to process review');
    } finally {
      setProcessing(false);
    }
  };

  const suspendHost = async (userId: string, appId: string) => {
    if (!confirm('Suspend this host?')) return;
    try {
      await updateDoc(doc(db, 'hostApplications', appId), { status: 'suspended', updatedAt: serverTimestamp() });
      const usersQuery = query(collection(db, 'users'), where('uid', '==', userId));
      const snap = await getDocs(usersQuery);
      if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, { hostStatus: 'suspended', updatedAt: serverTimestamp() });
      }
      toast.success('Host suspended');
      refetchApps();
    } catch { toast.error('Failed to suspend host'); }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <Activity size={16} /> },
    { key: 'pending', label: `Pending (${pendingApps?.length || 0})`, icon: <Clock size={16} /> },
    { key: 'hosts', label: 'All Applications', icon: <Users size={16} /> },
    { key: 'matches', label: 'Live Matches', icon: <Activity size={16} /> },
    { key: 'tournaments', label: 'Tournaments', icon: <Trophy size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
              <p className="text-gray-400 text-sm">Platform management & oversight</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Pending Hosts" value={pendingApps?.length || 0} icon={<Clock size={20} />} color="yellow" />
          <StatCard title="Live Matches" value={liveMatches.length} icon={<Activity size={20} />} color="red" />
          <StatCard title="Tournaments" value={tournaments?.length || 0} icon={<Trophy size={20} />} color="emerald" />
          <StatCard title="Total Applications" value={allApps?.length || 0} icon={<Users size={20} />} color="blue" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-gray-900 p-1 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all flex-shrink-0 ${
                activeTab === tab.key ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Pending Applications */}
        {activeTab === 'pending' && (
          <div className="rounded-2xl border border-gray-700 bg-gray-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white">Pending Host Applications</h2>
            </div>
            {pendingLoading ? (
              <div className="p-6"><TableSkeleton rows={3} cols={5} /></div>
            ) : !pendingApps || pendingApps.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle size={40} className="mx-auto text-emerald-500 mb-3" />
                <p className="text-gray-400">No pending applications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {pendingApps.map(app => (
                  <div key={app.id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {app.profilePhotoURL ? (
                          <img src={app.profilePhotoURL} alt="" className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-300 font-bold">{app.fullName?.[0]}</span>
                          </div>
                        )}
                        <div>
                          <p className="text-white font-semibold">{app.fullName}</p>
                          <p className="text-sm text-gray-400">{app.email} · {app.mobile}</p>
                          <p className="text-sm text-gray-500">{app.organizationName}</p>
                          <p className="text-xs text-gray-600 mt-1 max-w-md line-clamp-2">{app.tournamentExperience}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {app.idProofURL && (
                          <a href={app.idProofURL} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-blue-400 hover:bg-blue-500/10 transition-colors">
                            <Eye size={16} />
                          </a>
                        )}
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => openReview({ id: app.id, userId: app.userId, name: app.fullName }, 'approve')}
                        >
                          <CheckCircle size={14} /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => openReview({ id: app.id, userId: app.userId, name: app.fullName }, 'reject')}
                        >
                          <XCircle size={14} /> Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: All Applications */}
        {activeTab === 'hosts' && (
          <div className="rounded-2xl border border-gray-700 bg-gray-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white">All Host Applications</h2>
            </div>
            {allAppsLoading ? (
              <div className="p-6"><TableSkeleton rows={5} cols={5} /></div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {allApps?.map(app => (
                  <div key={app.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">{app.fullName}</p>
                      <p className="text-sm text-gray-500">{app.organizationName} · {app.email}</p>
                    </div>
                    <StatusBadge status={app.status} />
                    {app.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="danger"
                        icon={<Ban size={14} />}
                        onClick={() => suspendHost(app.userId, app.id)}
                      >
                        Suspend
                      </Button>
                    )}
                    {app.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="success" onClick={() => openReview({ id: app.id, userId: app.userId, name: app.fullName }, 'approve')}>Approve</Button>
                        <Button size="sm" variant="danger" onClick={() => openReview({ id: app.id, userId: app.userId, name: app.fullName }, 'reject')}>Reject</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Live Matches */}
        {activeTab === 'matches' && (
          <div className="rounded-2xl border border-gray-700 bg-gray-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white">Live Matches ({liveMatches.length})</h2>
            </div>
            {liveMatches.length === 0 ? (
              <div className="py-12 text-center text-gray-500">No live matches</div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {liveMatches.map(m => (
                  <div key={m.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{m.teamA.name} vs {m.teamB.name}</p>
                      <p className="text-sm text-gray-500">{m.venue} · {m.format} · Host: {m.hostName}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      {m.innings1 && <span className="text-white font-bold">{m.innings1.totalRuns}/{m.innings1.totalWickets}</span>}
                      <StatusBadge status="live" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Tournaments */}
        {activeTab === 'tournaments' && (
          <div className="rounded-2xl border border-gray-700 bg-gray-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white">All Tournaments ({tournaments?.length || 0})</h2>
            </div>
            {!tournaments || tournaments.length === 0 ? (
              <div className="py-12 text-center text-gray-500">No tournaments</div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {tournaments.map(t => (
                  <div key={t.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{t.name}</p>
                      <p className="text-sm text-gray-500">{t.location} · {t.teams?.length || 0} teams · By {t.organizer}</p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Review Modal */}
        <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title={`${reviewAction === 'approve' ? 'Approve' : 'Reject'} Host Application`}>
          <div className="space-y-4">
            {selectedApp && (
              <div className={`rounded-xl p-4 ${reviewAction === 'approve' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                <div className="flex items-center gap-2">
                  {reviewAction === 'approve' ? <CheckCircle size={20} className="text-emerald-400" /> : <AlertTriangle size={20} className="text-red-400" />}
                  <p className={`font-medium ${reviewAction === 'approve' ? 'text-emerald-300' : 'text-red-300'}`}>
                    {reviewAction === 'approve' ? 'Approving' : 'Rejecting'}: {selectedApp.name}
                  </p>
                </div>
              </div>
            )}
            <Input
              label="Review Note (Optional)"
              placeholder={reviewAction === 'approve' ? 'Welcome message or instructions...' : 'Reason for rejection...'}
              value={reviewNote}
              onChange={e => setReviewNote(e.target.value)}
            />
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setReviewModal(false)}>Cancel</Button>
              <Button
                variant={reviewAction === 'approve' ? 'success' : 'danger'}
                className="flex-1"
                loading={processing}
                onClick={processReview}
              >
                {reviewAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
