import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { Navbar } from '../components/ui/Navbar';

// Pages (lazy for performance)
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { MatchDetailPage } from '../pages/MatchDetailPage';
import { MatchesPage } from '../pages/MatchesPage';
import { TournamentPage } from '../pages/TournamentPage';
import { TournamentsListPage } from '../pages/TournamentsListPage';
import { HostDashboardPage } from '../pages/HostDashboardPage';
import { ScoringPage } from '../pages/ScoringPage';
import { AdminPanelPage } from '../pages/AdminPanelPage';
import { ProfilePage } from '../pages/ProfilePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requireHost?: boolean; requireAdmin?: boolean }> = ({
  children,
  requireHost = false,
  requireAdmin = false,
}) => {
  const { user, loading, isHost, isAdmin } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  if (requireHost && !isHost) return <Navigate to="/" replace />;

  return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode; showNav?: boolean }> = ({
  children,
  showNav = true,
}) => (
  <>
    {showNav && <Navbar />}
    {children}
  </>
);

export const AppRouter: React.FC = () => {
  const { loading } = useAuth();

  if (loading) return <PageLoader />;

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* With Navbar */}
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />
      <Route
        path="/matches"
        element={
          <Layout>
            <MatchesPage />
          </Layout>
        }
      />
      <Route
        path="/match/:id"
        element={
          <Layout>
            <MatchDetailPage />
          </Layout>
        }
      />
      <Route
        path="/tournaments"
        element={
          <Layout>
            <TournamentsListPage />
          </Layout>
        }
      />
      <Route
        path="/tournament/:id"
        element={
          <Layout>
            <TournamentPage />
          </Layout>
        }
      />

      {/* Protected */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/host"
        element={
          <ProtectedRoute requireHost>
            <Layout>
              <HostDashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/match/:id/score"
        element={
          <ProtectedRoute requireHost>
            <Layout>
              <ScoringPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <AdminPanelPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
