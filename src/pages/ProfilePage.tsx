import React, { useState } from 'react';
import { User, Mail, Shield, Camera, LogOut, Edit2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../firebase/auth';
import { uploadToCloudinary } from '../lib/cloudinary';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/login');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'cricarena/avatars');
      await updateProfile(user, { photoURL: url });
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
      toast.success('Photo updated!');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !displayName.trim()) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, 'users', user.uid), { displayName });
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen hero-bg pt-20 flex items-center justify-center">
        <p className="text-slate-400">Please sign in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-bg pt-20">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
          Profile
        </h1>

        {/* Avatar */}
        <div className="glass-card rounded-2xl p-6 mb-4 text-center">
          <div className="relative inline-block mb-4">
            <Avatar
              name={user.displayName ?? user.email ?? 'User'}
              src={user.photoURL}
              size="xl"
            />
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-400 transition-colors shadow-lg">
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera size={14} className="text-white" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {editing ? (
            <div className="space-y-3 max-w-xs mx-auto">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" className="flex-1" loading={saving} onClick={handleSave} icon={<Save size={13} />}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-0.5">
                {user.displayName ?? 'User'}
              </h2>
              <p className="text-slate-400 text-sm">{user.email}</p>
              {profile?.role && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 capitalize">
                  {profile.role}
                </span>
              )}
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 mx-auto mt-3 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <Edit2 size={12} /> Edit Profile
              </button>
            </>
          )}
        </div>

        {/* Info Cards */}
        <div className="space-y-3 mb-6">
          {[
            { icon: <User size={16} />, label: 'Display Name', value: user.displayName ?? 'Not set' },
            { icon: <Mail size={16} />, label: 'Email', value: user.email ?? 'Not set' },
            { icon: <Shield size={16} />, label: 'Role', value: profile?.role ?? 'viewer' },
          ].map((item) => (
            <div key={item.label} className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="text-slate-500">{item.icon}</div>
              <div>
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="text-sm font-medium text-white capitalize">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sign Out */}
        <Button
          variant="danger"
          className="w-full"
          onClick={handleSignOut}
          icon={<LogOut size={16} />}
        >
          Sign Out
        </Button>

        {/* Cloudinary note */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Photos are stored via{' '}
          <span className="text-slate-500">Cloudinary</span>
        </p>
      </div>
    </div>
  );
};
