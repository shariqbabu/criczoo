import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTeams } from '../../hooks/useTeams';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import type { MatchFormat } from '../../types';
import toast from 'react-hot-toast';

const schema = z.object({
  teamAId: z.string().min(1, 'Select Team A'),
  teamBId: z.string().min(1, 'Select Team B'),
  venue: z.string().min(2, 'Venue required'),
  format: z.enum(['T10', 'T20', 'ODI', 'Test', 'Custom']),
  customOvers: z.string().optional(),
  matchType: z.enum(['friendly', 'league', 'knockout', 'tournament']),
  scheduledAt: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const formatOvers: Record<string, number> = { T10: 10, T20: 20, ODI: 50, Test: 90, Custom: 20 };

export default function CreateMatchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { currentUser, userProfile } = useAuth();
  const { data: teams } = useTeams(currentUser?.uid || '');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { format: 'T20', matchType: 'friendly' },
  });

  const format = watch('format') as MatchFormat;
  const teamAId = watch('teamAId');

  const teamAOptions = [{ value: '', label: 'Select Team A' }, ...(teams?.map(t => ({ value: t.id, label: t.name })) || [])];
  const teamBOptions = [{ value: '', label: 'Select Team B' }, ...(teams?.filter(t => t.id !== teamAId).map(t => ({ value: t.id, label: t.name })) || [])];

  const onSubmit = async (data: FormData) => {
    if (!currentUser || !userProfile) return;
    try {
      const teamA = teams?.find(t => t.id === data.teamAId);
      const teamB = teams?.find(t => t.id === data.teamBId);
      if (!teamA || !teamB) { toast.error('Select valid teams'); return; }

      const totalOvers = data.format === 'Custom' ? parseInt(data.customOvers || '20') : formatOvers[data.format];

      const matchData = {
        teamA: { id: teamA.id, name: teamA.name, shortName: teamA.shortName, logoURL: teamA.logoURL || '' },
        teamB: { id: teamB.id, name: teamB.name, shortName: teamB.shortName, logoURL: teamB.logoURL || '' },
        venue: data.venue,
        format: data.format,
        customOvers: totalOvers,
        totalOvers,
        matchType: data.matchType,
        hostId: currentUser.uid,
        hostName: userProfile.name,
        status: 'upcoming',
        currentInnings: 1,
        recentBalls: [],
        scheduledAt: data.scheduledAt || '',
        innings1: {
          id: `inn1_${Date.now()}`,
          inningsNumber: 1,
          battingTeamId: teamA.id,
          bowlingTeamId: teamB.id,
          battingTeamName: teamA.name,
          bowlingTeamName: teamB.name,
          totalRuns: 0,
          totalWickets: 0,
          totalBalls: 0,
          totalOvers: 0,
          extras: { wide: 0, noball: 0, bye: 0, legbye: 0, total: 0 },
          batsmen: [],
          bowlers: [],
          partnerships: [],
          fallOfWickets: [],
          ballByBall: [],
          status: 'notstarted',
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'matches'), matchData);
      toast.success('Match created successfully!');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create match');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Match" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Team A"
            options={teamAOptions}
            error={errors.teamAId?.message}
            {...register('teamAId')}
            required
          />
          <Select
            label="Team B"
            options={teamBOptions}
            error={errors.teamBId?.message}
            {...register('teamBId')}
            required
          />
        </div>

        <Input label="Venue" placeholder="Stadium / Ground name" error={errors.venue?.message} {...register('venue')} required />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Match Format"
            options={[
              { value: 'T10', label: 'T10' },
              { value: 'T20', label: 'T20' },
              { value: 'ODI', label: 'ODI (50 Overs)' },
              { value: 'Test', label: 'Test Match' },
              { value: 'Custom', label: 'Custom Overs' },
            ]}
            {...register('format')}
          />
          <Select
            label="Match Type"
            options={[
              { value: 'friendly', label: 'Friendly' },
              { value: 'league', label: 'League' },
              { value: 'knockout', label: 'Knockout' },
              { value: 'tournament', label: 'Tournament' },
            ]}
            {...register('matchType')}
          />
        </div>

        {format === 'Custom' && (
          <Input label="Custom Overs" type="number" placeholder="e.g. 15" {...register('customOvers')} />
        )}

        <Input label="Scheduled Date & Time" type="datetime-local" {...register('scheduledAt')} />

        {teams && teams.length < 2 && (
          <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3">
            <p className="text-xs text-yellow-400">You need at least 2 teams. <a href="#" className="underline">Create teams first</a></p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={isSubmitting} disabled={!teams || teams.length < 2}>
            Create Match
          </Button>
        </div>
      </form>
    </Modal>
  );
}
