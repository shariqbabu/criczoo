import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/common/Layout';
import { ArrowLeft } from 'lucide-react';

export default function EditMatchPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/host/matches" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Matches
        </Link>
        <h1 className="text-2xl font-bold mb-6">Edit Match</h1>
        <div className="bg-white rounded-2xl border border-border p-6">
          <p className="text-muted-foreground text-sm">Match ID: {matchId}</p>
          <p className="text-muted-foreground text-sm mt-2">Edit functionality — update team selections, venue, date, and overs.</p>
        </div>
      </div>
    </Layout>
  );
}
