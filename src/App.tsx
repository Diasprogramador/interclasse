import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ErrorScreen, LoadingScreen } from './components/PageState'
import { useAuth } from './contexts/AuthContext'
import { useAppData } from './contexts/AppDataContext'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { GamesPage } from './pages/GamesPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { RankingPage } from './pages/RankingPage'
import { SettingsPage } from './pages/SettingsPage'
import { StatsPage } from './pages/StatsPage'
import { TeamPage } from './pages/TeamPage'
import { BracketPage } from './pages/BracketPage'
import { EventControlPage } from './pages/EventControlPage'

function ProtectedArea() {
  const { user, loading: authLoading } = useAuth()
  const { data, loading, error } = useAppData()
  if (authLoading || (user && loading)) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (error) return <ErrorScreen message={error} />
  if (!data) return <LoadingScreen />
  if (!data.classroom) return <OnboardingPage />
  return <AppLayout><Outlet /></AppLayout>
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<AuthPage />} />
    <Route element={<ProtectedArea />}>
      <Route index element={<DashboardPage />} />
      <Route path="meu-time" element={<TeamPage />} />
      <Route path="classificacao" element={<RankingPage />} />
      <Route path="chaveamento" element={<BracketPage />} />
      <Route path="estatisticas" element={<StatsPage />} />
      <Route path="jogos" element={<GamesPage />} />
      <Route path="evento" element={<EventControlPage />} />
      <Route path="configuracoes" element={<SettingsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
