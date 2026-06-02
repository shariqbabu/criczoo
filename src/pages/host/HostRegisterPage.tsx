import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { User, Phone, Mail, Building, MapPin, Upload, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  fullName: z.string().min(2, 'Required'),
  mobile: z.string().min(10, 'Valid mobile required'),
  email: z.string().email('Valid email required'),
  organizationName: z.string().min(2, 'Required'),
  tournamentExperience: z.string().min(10, 'Describe your experience (min 10 chars)'),
  address: z.string().min(10, 'Full address required'),
});

type FormData = z.infer<typeof schema>;

export default function HostRegisterPage() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [idProof, setIdProof] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: userProfile?.name || '',
      email: userProfile?.email || '',
      mobile: userProfile?.mobile || '',
    },
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-white mb-4">Please sign in to apply as a host</h2>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    try {
      let idProofURL = '';
      let profilePhotoURL = '';

      if (idProof) {
        try { idProofURL = await uploadToCloudinary(idProof, 'id-proofs'); } catch { /* continue */ }
      }
      if (profilePhoto) {
        try { profilePhotoURL = await uploadToCloudinary(profilePhoto, 'host-profiles'); } catch { /* continue */ }
      }

      await addDoc(collection(db, 'hostApplications'), {
        ...data,
        userId: currentUser.uid,
        idProofURL,
        profilePhotoURL,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('Application submitted! Await admin approval.');
      navigate('/');
    } catch {
      toast.error('Failed to submit application. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-purple-600 shadow-lg mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Host Registration</h1>
            <p className="text-gray-400">Apply to create and manage cricket tournaments</p>
          </div>

          {/* Pending Notice */}
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 mb-8">
            <div className="flex items-start gap-3">
              <Clock size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-300 font-medium">Application Review Process</p>
                <p className="text-yellow-400/70 text-sm mt-1">
                  Your application will be reviewed by our admin team. You'll receive a notification once approved. 
                  This process typically takes 1-3 business days.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-700 bg-gray-900/80 p-8">
            {/* Profile Photo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-2 border-dashed border-gray-600 overflow-hidden bg-gray-800 flex items-center justify-center">
                  {profilePreview ? (
                    <img src={profilePreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <User size={32} className="text-gray-500" />
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-blue-500 p-1.5 hover:bg-blue-600 transition-colors">
                  <Upload size={14} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) { setProfilePhoto(f); setProfilePreview(URL.createObjectURL(f)); }
                    }}
                  />
                </label>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mb-6">Upload your profile photo</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" icon={<User size={16} />} error={errors.fullName?.message} {...register('fullName')} required />
                <Input label="Mobile Number" type="tel" icon={<Phone size={16} />} error={errors.mobile?.message} {...register('mobile')} required />
              </div>
              <Input label="Email Address" type="email" icon={<Mail size={16} />} error={errors.email?.message} {...register('email')} required />
              <Input label="Organization / Club Name" icon={<Building size={16} />} error={errors.organizationName?.message} {...register('organizationName')} required />
              <Input label="Full Address" icon={<MapPin size={16} />} error={errors.address?.message} {...register('address')} required />
              <Textarea
                label="Tournament Experience"
                placeholder="Describe your cricket organizing experience, number of tournaments organized, etc."
                rows={4}
                error={errors.tournamentExperience?.message}
                {...register('tournamentExperience')}
                required
              />

              {/* ID Proof Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  ID Proof (Government ID) <span className="text-gray-500">(optional but recommended)</span>
                </label>
                <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-600 bg-gray-800/50 p-6 cursor-pointer hover:border-blue-500/50 transition-colors">
                  <Upload size={24} className="text-gray-500" />
                  <span className="text-sm text-gray-400">
                    {idProof ? idProof.name : 'Click to upload ID proof'}
                  </span>
                  <span className="text-xs text-gray-600">Aadhar, Passport, Driving License</span>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => setIdProof(e.target.files?.[0] || null)} />
                </label>
              </div>

              <Button type="submit" className="w-full" size="lg" loading={isSubmitting} variant="secondary">
                Submit Application
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
