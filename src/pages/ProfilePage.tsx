// src/pages/ProfilePage.tsx

import { useState } from 'react';
import { User, Mail, Phone, Shield, Camera, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadToCloudinary } from '../lib/cloudinary';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { currentUser, userProfile, refreshProfile } = useAuth();

  const [name, setName] = useState(userProfile?.name || '');
  const [mobile, setMobile] = useState(userProfile?.mobile || '');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(userProfile?.photoURL || '');
  const [loading, setLoading] = useState(false);

  if (!currentUser || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Please login first</p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setLoading(true);

      let photoURL = userProfile.photoURL || '';

      if (image) {
        photoURL = await uploadToCloudinary(image, 'profiles');
      }

      await updateDoc(doc(db, 'users', currentUser.uid), {
        name,
        mobile,
        photoURL,
        updatedAt: serverTimestamp(),
      });

      await refreshProfile();

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="mx-auto max-w-3xl">

        <div className="rounded-3xl border border-gray-700 bg-gray-900 overflow-hidden">

          <div className="h-32 bg-gradient-to-r from-emerald-500 to-blue-600" />

          <div className="px-8 pb-8">

            <div className="-mt-16 flex flex-col items-center">

              <div className="relative">
                <img
                  src={
                    preview ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      name || 'User'
                    )}`
                  }
                  alt=""
                  className="h-32 w-32 rounded-full border-4 border-gray-900 object-cover"
                />

                <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-emerald-500 p-2">
                  <Camera size={16} className="text-white" />

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (!file) return;

                      setImage(file);
                      setPreview(URL.createObjectURL(file));
                    }}
                  />
                </label>
              </div>

              <h1 className="mt-4 text-3xl font-bold text-white">
                {userProfile.name}
              </h1>

              <span className="mt-2 rounded-full bg-emerald-500/20 px-4 py-1 text-sm text-emerald-400">
                {userProfile.role.toUpperCase()}
              </span>

              {userProfile.hostStatus && (
                <span className="mt-2 rounded-full bg-blue-500/20 px-4 py-1 text-sm text-blue-400">
                  Host Status: {userProfile.hostStatus}
                </span>
              )}
            </div>

            <div className="mt-10 grid gap-5">

              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User size={16} />}
              />

              <Input
                label="Email"
                value={userProfile.email}
                disabled
                icon={<Mail size={16} />}
              />

              <Input
                label="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                icon={<Phone size={16} />}
              />

              <div className="rounded-xl border border-gray-700 p-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Shield size={18} />
                  <span>Role</span>
                </div>

                <p className="mt-2 text-white font-medium">
                  {userProfile.role}
                </p>
              </div>

              <Button
                onClick={handleSave}
                loading={loading}
                icon={<Save size={16} />}
              >
                Save Changes
              </Button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
