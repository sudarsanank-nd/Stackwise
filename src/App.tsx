import type { ReactNode } from 'react';
import { HashRouter, MemoryRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { useApplyTheme } from './hooks/useAppData';
import { AppShell } from './components/navigation/AppShell';
import { ErrorBoundary } from './components/common/ui';
import FeedPage from './pages/FeedPage';
import SessionPage from './pages/SessionPage';
import CardDetailPage from './pages/CardDetailPage';
import StoryPage from './pages/StoryPage';
import SearchPage from './pages/SearchPage';
import MapPage from './pages/MapPage';
import CompletePage from './pages/CompletePage';
import { TopicPage, TopicsPage } from './pages/TopicsPage';
import { GymListPage, GymScenarioPage } from './pages/GymPages';
import { CollectionPage, ShelfPage } from './pages/ShelfPages';
import { HistoryPage, ProfilePage, SettingsPage } from './pages/ProfilePages';
import { AboutPage, CollidePage, NotFoundPage, OnboardingPage, WelcomePage } from './pages/MiscPages';

/** Routes that need a completed profile; otherwise send the reader to Welcome. */
function RequireProfile({ children }: { children: ReactNode }) {
  const profile = useAppStore((s) => s.profile);
  const loc = useLocation();
  if (!profile) return <Navigate to="/welcome" replace state={{ from: loc.pathname }} />;
  return (
    <AppShell>
      <ErrorBoundary key={loc.pathname}>{children}</ErrorBoundary>
    </AppShell>
  );
}

export function AppRoutes() {
  const profile = useAppStore((s) => s.profile);
  const guarded: [string, ReactNode][] = [
    ['/feed', <FeedPage key="/feed" />],
    ['/session', <SessionPage key="/session" />],
    ['/card/:id', <CardDetailPage key="/card/:id" />],
    ['/search', <SearchPage key="/search" />],
    ['/topics', <TopicsPage key="/topics" />],
    ['/topics/:topicId', <TopicPage key="/topics/:topicId" />],
    ['/gym', <GymListPage key="/gym" />],
    ['/gym/:id', <GymScenarioPage key="/gym/:id" />],
    ['/shelf', <ShelfPage key="/shelf" />],
    ['/shelf/:id', <CollectionPage key="/shelf/:id" />],
    ['/map', <MapPage key="/map" />],
    ['/complete', <CompletePage key="/complete" />],
    ['/profile', <ProfilePage key="/profile" />],
    ['/settings', <SettingsPage key="/settings" />],
    ['/history', <HistoryPage key="/history" />],
    ['/collide', <CollidePage key="/collide" />],
  ];
  return (
    <Routes>
      <Route path="/" element={<Navigate to={profile ? '/feed' : '/welcome'} replace />} />
      <Route path="/welcome" element={profile ? <Navigate to="/feed" replace /> : <WelcomePage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route
        path="/about"
        element={
          profile ? (
            <AppShell>
              <AboutPage />
            </AppShell>
          ) : (
            <div className="mx-auto max-w-2xl px-4 py-8">
              <AboutPage />
            </div>
          )
        }
      />
      <Route path="/story/:id" element={profile ? <ErrorBoundary><StoryPage /></ErrorBoundary> : <Navigate to="/welcome" replace />} />
      {guarded.map(([path, el]) => (
        <Route key={path} path={path} element={<RequireProfile>{el}</RequireProfile>} />
      ))}
      <Route
        path="*"
        element={
          <RequireProfile>
            <NotFoundPage />
          </RequireProfile>
        }
      />
    </Routes>
  );
}

// The single-file build runs inside hosts that may not allow hash paths, so it keeps routes in memory.
const Router = import.meta.env.MODE === 'artifact' ? MemoryRouter : HashRouter;

export default function App() {
  useApplyTheme();
  return (
    <ErrorBoundary>
      <Router>
        <AppRoutes />
      </Router>
    </ErrorBoundary>
  );
}
