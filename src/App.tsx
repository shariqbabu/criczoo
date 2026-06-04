import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ProtectedRoute, HostRoute, AdminRoute, PublicOnlyRoute } from '@/components/auth/RouteGuards';
import { Suspense, lazy } from 'react';
import { LoadingScreen } from '@/components/common/LoadingScreen';

// Auth pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));

// Public pages
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const LiveMatchesPage = lazy(() => import('@/pages/public/LiveMatchPage'));
const MatchDetailPage = lazy(() => import('@/pages/public/MatchDetailPage'));
const ScorecardPage = lazy(() => import('@/pages/public/ScorecardPage'));
const TeamsPage = lazy(() => import('@/pages/public/TeamsPage'));
const TeamDetailPage = lazy(() => import('@/pages/public/TeamDetailPage'));
const PlayersPage = lazy(() => import('@/pages/public/PlayersPage'));
const PlayerDetailPage = lazy(() => import('@/pages/public/PlayerDetailPage'));
const TournamentsPage = lazy(() => import('@/pages/public/TournamentsPage'));
const TournamentDetailPage = lazy(() => import('@/pages/public/TournamentDetailPage'));
const LeaderboardPage = lazy(() => import('@/pages/public/LeaderboardPage'));

// Host pages
const HostDashboard = lazy(() => import('@/pages/host/HostDashboard'));
const HostMatchesPage = lazy(() => import('@/pages/host/HostMatchesPage'));
const CreateMatchPage = lazy(() => import('@/pages/host/CreateMatchPage'));
const EditMatchPage = lazy(() => import('@/pages/host/EditMatchPage'));
const ScoringPage = lazy(() => import('@/pages/scoring/ScoringPage'));
const ManageTeamsPage = lazy(() => import('@/pages/host/ManageTeamsPage'));
const CreateTeamPage = lazy(() => import('@/pages/host/CreateTeamPage'));
const ManagePlayersPage = lazy(() => import('@/pages/host/ManagePlayersPage'));
const CreatePlayerPage = lazy(() => import('@/pages/host/CreatePlayerPage'));
const HostTournamentsPage = lazy(() => import('@/pages/host/HostTournamentsPage'));
const CreateTournamentPage = lazy(() => import('@/pages/host/CreateTournamentPage'));
const HostApplyPage = lazy(() => import('@/pages/host/HostApplyPage'));

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminHostAppsPage = lazy(() => import('@/pages/admin/AdminHostAppsPage'));
const AdminMatchesPage = lazy(() => import('@/pages/admin/AdminMatchesPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));

// Profile page
const ProfilePage = lazy(() => import('@/pages/auth/ProfilePage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Auth */}
                <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
                <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
                <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
                <Route path="/verify-email" element={<ProtectedRoute><VerifyEmailPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                {/* Public */}
                <Route path="/" element={<HomePage />} />
                <Route path="/live" element={<LiveMatchesPage />} />
                <Route path="/matches/:matchId" element={<MatchDetailPage />} />
                <Route path="/matches/:matchId/scorecard" element={<ScorecardPage />} />
                <Route path="/teams" element={<TeamsPage />} />
                <Route path="/teams/:teamId" element={<TeamDetailPage />} />
                <Route path="/players" element={<PlayersPage />} />
                <Route path="/players/:playerId" element={<PlayerDetailPage />} />
                <Route path="/tournaments" element={<TournamentsPage />} />
                <Route path="/tournaments/:tournamentId" element={<TournamentDetailPage />} />
                <Route path="/leaderboards" element={<LeaderboardPage />} />

                {/* Host */}
                <Route path="/host/apply" element={<ProtectedRoute><HostApplyPage /></ProtectedRoute>} />
                <Route path="/host" element={<HostRoute><HostDashboard /></HostRoute>} />
                <Route path="/host/matches" element={<HostRoute><HostMatchesPage /></HostRoute>} />
                <Route path="/host/matches/create" element={<HostRoute><CreateMatchPage /></HostRoute>} />
                <Route path="/host/matches/:matchId/edit" element={<HostRoute><EditMatchPage /></HostRoute>} />
                <Route path="/host/matches/:matchId/score" element={<HostRoute><ScoringPage /></HostRoute>} />
                <Route path="/host/teams" element={<HostRoute><ManageTeamsPage /></HostRoute>} />
                <Route path="/host/teams/create" element={<HostRoute><CreateTeamPage /></HostRoute>} />
                <Route path="/host/players" element={<HostRoute><ManagePlayersPage /></HostRoute>} />
                <Route path="/host/players/create" element={<HostRoute><CreatePlayerPage /></HostRoute>} />
                <Route path="/host/tournaments" element={<HostRoute><HostTournamentsPage /></HostRoute>} />
                <Route path="/host/tournaments/create" element={<HostRoute><CreateTournamentPage /></HostRoute>} />

                {/* Admin */}
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
                <Route path="/admin/host-applications" element={<AdminRoute><AdminHostAppsPage /></AdminRoute>} />
                <Route path="/admin/matches" element={<AdminRoute><AdminMatchesPage /></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
