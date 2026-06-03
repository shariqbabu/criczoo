import { useEffect, useState } from 'react';
import Layout from '@/components/common/Layout';
import { getDocById, updateDocById } from '@/lib/firestore';
import { Settings, Save, AlertTriangle, Bell, Users, Activity } from 'lucide-react';
import type { AppSettings } from '@/types';

const SETTINGS_DOC_ID = 'global';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<AppSettings>>({
    maintenanceMode: false,
    allowRegistration: true,
    allowHostApplications: true,
    announcementActive: false,
    announcementText: '',
    featuredMatchIds: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getDocById<AppSettings>('appSettings', SETTINGS_DOC_ID)
      .then(s => { if (s) setSettings(s); })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key: keyof AppSettings) =>
    setSettings(s => ({ ...s, [key]: !s[key as keyof typeof s] }));

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    await updateDocById('appSettings', SETTINGS_DOC_ID, { ...settings, updatedAt: new Date() });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const ToggleRow = ({ icon: Icon, label, desc, settingKey }: { icon: any; label: string; desc: string; settingKey: keyof AppSettings }) => (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <button onClick={() => handleToggle(settingKey)}
        className={`relative w-11 h-6 rounded-full transition-colors ${settings[settingKey] ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[settingKey] ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">App Settings</h1>
          <button onClick={handleSave} disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="shimmer h-20 rounded-xl" />)}</div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-border p-5 mb-4">
              <h2 className="font-semibold mb-1">Platform Controls</h2>
              <p className="text-xs text-muted-foreground mb-4">Toggle core platform features</p>
              <ToggleRow icon={AlertTriangle} label="Maintenance Mode" desc="Take the platform offline for maintenance" settingKey="maintenanceMode" />
              <ToggleRow icon={Users} label="Allow Registration" desc="Let new users sign up" settingKey="allowRegistration" />
              <ToggleRow icon={Activity} label="Host Applications" desc="Accept new host applications" settingKey="allowHostApplications" />
            </div>

            <div className="bg-white rounded-xl border border-border p-5">
              <h2 className="font-semibold mb-4">Announcement Banner</h2>
              <ToggleRow icon={Bell} label="Show Announcement" desc="Display announcement to all users" settingKey="announcementActive" />
              {settings.announcementActive && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1.5">Announcement Text</label>
                  <textarea
                    value={settings.announcementText || ''}
                    onChange={e => setSettings(s => ({ ...s, announcementText: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    placeholder="e.g. Platform maintenance on Sunday 2–4 AM" />
                </div>
              )}
            </div>

            {settings.maintenanceMode && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Maintenance Mode is ON</p>
                  <p className="text-xs text-red-700 mt-0.5">All public pages are currently unavailable to non-admins.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
