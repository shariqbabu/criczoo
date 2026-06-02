import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/layout/Layout';


import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HostDashboard from './pages/host/HostDashboard';
import HostRegisterPage from './pages/host/HostRegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import MatchesPage from './pages/matches/MatchesPage';
import MatchDetailPage from './pages/matches/MatchDetailPage';
import TournamentsPage from './pages/tournaments/TournamentsPage';
import TournamentDetailPage from './pages/tournaments/TournamentDetailPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Main Layout Routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/matches/:id" element={<MatchDetailPage />} />
              <Route path="/tournaments" element={<TournamentsPage />} />
              <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
              <Route path="/host" element={<HostDashboard />} />           
            <Route

                path="/host/register"
                element={<HostRegisterPage />}
              />

              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}