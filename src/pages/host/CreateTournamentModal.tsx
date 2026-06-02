import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(3, 'Tournament name required'),
  location: z.string().min(2, 'Location required'),
  startDate: z.string().min(1, 'Start date required'),
  endDate: z.string().min(1, 'End date required'),
  format: z.enum(['league', 'knockout', 'group+knockout']),
  rules: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateTournamentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { currentUser, userProfile } = useAuth();
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { format: 'league' },
  });

  const onSubmit = async (data: FormData) => {
    if (!currentUser || !userProfile) return;
    try {
      let bannerURL = '';
      if (banner) {
        try { bannerURL = await uploadToCloudinary(banner, 'tournament-banners'); } catch { /* continue */ }
      }

      await addDoc(collection(db, 'tournaments'), {
        ...data,
        bannerURL,
        organizer: userProfile.name,
        organizerId: currentUser.uid,
        status: 'upcoming',
        teams: [],
        matches: [],
        pointsTable: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('Tournament created!');
      onClose();
    } catch {
      toast.error('Failed to create tournament');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Tournament" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Banner Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Tournament Banner</label>
          <label className="relative flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-600 bg-gray-800/50 hover:border-emerald-500/50 transition-colors">
            {bannerPreview ? (
              <img src={bannerPreview} alt="Banner" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={24} className="text-gray-500" />
                <span className="text-sm text-gray-400">Upload banner image</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) { setBanner(f); setBannerPreview(URL.createObjectURL(f)); }
              }}
            />
          </label>
        </div>

        <Input label="Tournament Name" placeholder="e.g. Summer Cricket League 2024" error={errors.name?.message} {...register('name')} required />
        <Input label="Location / City" placeholder="e.g. Mumbai, Maharashtra" error={errors.location?.message} {...register('location')} required />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Date" type="date" error={errors.startDate?.message} {...register('startDate')} required />
          <Input label="End Date" type="date" error={errors.endDate?.message} {...register('endDate')} required />
        </div>

        <Select
          label="Tournament Format"
          options={[
            { value: 'league', label: 'League (Round Robin)' },
            { value: 'knockout', label: 'Knockout / Elimination' },
            { value: 'group+knockout', label: 'Group Stage + Knockout' },
          ]}
          {...register('format')}
        />

        <Textarea
          label="Rules & Regulations"
          placeholder="Enter tournament rules, playing conditions, etc."
          rows={3}
          {...register('rules')}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={isSubmitting} variant="secondary">
            Create Tournament
          </Button>
        </div>
      </form>
    </Modal>
  );
}
