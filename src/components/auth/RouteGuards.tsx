import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/common/LoadingScreen';

interface RouteProps {
  children: React.ReactNode;
}

// Requires user to be logged in
export function ProtectedRoute({ children }: RouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Requires user to be a host or admin
export function HostRoute({ children }: RouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile?.role !== 'host' && profile?.role !== 'admin') {
    return <Navigate to="/host/apply" replace />;
  }

  return <>{children}</>;
}

// Requires user to be an admin
export function AdminRoute({ children }: RouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Redirects logged-in users away from auth pages
export function PublicOnlyRoute({ children }: RouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
