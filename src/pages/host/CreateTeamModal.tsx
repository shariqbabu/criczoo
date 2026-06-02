import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Upload, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Team name required'),
  shortName: z.string().min(2, 'Short name required (2-4 chars)').max(4),
});

type FormData = z.infer<typeof schema>;

interface PlayerEntry {
  name: string;
  role: 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper';
}

export default function CreateTeamModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { currentUser } = useAuth();
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [players, setPlayers] = useState<PlayerEntry[]>([
    { name: '', role: 'batsman' },
    { name: '', role: 'batsman' },
  ]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const addPlayer = () => setPlayers(prev => [...prev, { name: '', role: 'batsman' }]);
  const removePlayer = (i: number) => setPlayers(prev => prev.filter((_, idx) => idx !== i));
  const updatePlayer = (i: number, field: keyof PlayerEntry, value: string) => {
    setPlayers(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };

  const onSubmit = async (data: FormData) => {
    if (!currentUser) return;
    try {
      let logoURL = '';
      if (logo) {
        try { logoURL = await uploadToCloudinary(logo, 'team-logos'); } catch { /* continue */ }
      }

      const teamRef = await addDoc(collection(db, 'teams'), {
        name: data.name,
        shortName: data.shortName.toUpperCase(),
        logoURL,
        players: [],
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        stats: { matches: 0, wins: 0, losses: 0, draws: 0, points: 0, nrr: 0 },
      });

      // Add players
      const validPlayers = players.filter(p => p.name.trim());
      const playerIds: string[] = [];
      for (const player of validPlayers) {
        const playerRef = await addDoc(collection(db, 'players'), {
          name: player.name.trim(),
          role: player.role,
          teamId: teamRef.id,
          createdBy: currentUser.uid,
          stats: { matches: 0, runs: 0, balls: 0, fours: 0, sixes: 0, wickets: 0, overs: 0, runsConceded: 0, highestScore: 0, bestBowling: '-', strikeRate: 0, average: 0, economy: 0, fifties: 0, hundreds: 0 },
        });
        playerIds.push(playerRef.id);
      }

      // Update team with player IDs
      if (playerIds.length > 0) {
        const { updateDoc } = await import('firebase/firestore');
        await updateDoc(teamRef, { players: playerIds });
      }

      toast.success(`Team "${data.name}" created with ${validPlayers.length} players!`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create team');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Team" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <label className="cursor-pointer">
            <div className="h-16 w-16 rounded-full border-2 border-dashed border-gray-600 overflow-hidden bg-gray-800 flex items-center justify-center hover:border-emerald-500 transition-colors">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <Upload size={20} className="text-gray-500" />
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={e => {
              const f = e.target.files?.[0];
              if (f) { setLogo(f); setLogoPreview(URL.createObjectURL(f)); }
            }} />
          </label>
          <div className="flex-1 grid grid-cols-2 gap-3">
            <Input label="Team Name" placeholder="e.g. Mumbai Warriors" error={errors.name?.message} {...register('name')} required />
            <Input label="Short Name" placeholder="e.g. MW" maxLength={4} error={errors.shortName?.message} {...register('shortName')} required />
          </div>
        </div>

        {/* Players */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-300">Players</label>
            <button type="button" onClick={addPlayer} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
              <Plus size={14} /> Add Player
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {players.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={p.name}
                  onChange={e => updatePlayer(i, 'name', e.target.value)}
                  placeholder={`Player ${i + 1} name`}
                  className="flex-1 rounded-xl border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
                />
                <select
                  value={p.role}
                  onChange={e => updatePlayer(i, 'role', e.target.value)}
                  className="rounded-xl border border-gray-700 bg-gray-800/50 px-2 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="batsman">Batsman</option>
                  <option value="bowler">Bowler</option>
                  <option value="allrounder">All-Rounder</option>
                  <option value="wicketkeeper">WK</option>
                </select>
                <button type="button" onClick={() => removePlayer(i)} className="rounded-lg p-2 text-red-400 hover:bg-red-500/10">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={isSubmitting}>Create Team</Button>
        </div>
      </form>
    </Modal>
  );
}
