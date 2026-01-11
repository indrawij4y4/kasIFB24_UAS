import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { type ReactNode, lazy, Suspense, useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { LoginScreen } from './features/auth/LoginScreen';
import { ForceChangeScreen } from './features/auth/ForceChangeScreen';
import { Loader2 } from 'lucide-react';

// Preload functions for each route chunk
const preloadDashboard = () => import('./features/dashboard/DashboardScreen');
const preloadMatrix = () => import('./features/matrix/MatrixScreen');
const preloadReport = () => import('./features/report/ReportScreen');
const preloadLeaderboard = () => import('./features/leaderboard/LeaderboardScreen');
const preloadExport = () => import('./features/export/ExportScreen');
const preloadArrears = () => import('./features/admin/ArrearsScreen');
const preloadInputForms = () => import('./features/admin/InputForms');
const preloadSettings = () => import('./features/settings/SettingsScreen');

// Lazy load routes for code splitting
const DashboardScreen = lazy(() => preloadDashboard().then(m => ({ default: m.DashboardScreen })));
const MatrixScreen = lazy(() => preloadMatrix().then(m => ({ default: m.MatrixScreen })));
const ReportScreen = lazy(() => preloadReport().then(m => ({ default: m.ReportScreen })));
const LeaderboardScreen = lazy(() => preloadLeaderboard().then(m => ({ default: m.LeaderboardScreen })));
const ExportScreen = lazy(() => preloadExport().then(m => ({ default: m.ExportScreen })));
const ArrearsScreen = lazy(() => preloadArrears().then(m => ({ default: m.ArrearsScreen })));
const InputInScreen = lazy(() => preloadInputForms().then(m => ({ default: m.InputInScreen })));
const InputOutScreen = lazy(() => preloadInputForms().then(m => ({ default: m.InputOutScreen })));
const SettingsScreen = lazy(() => preloadSettings().then(m => ({ default: m.SettingsScreen })));

// Preload all route chunks (call this after login)
export function preloadAllRoutes() {
  preloadDashboard();
  preloadMatrix();
  preloadReport();
  preloadLeaderboard();
  preloadExport();
  preloadArrears();
  preloadInputForms();
  preloadSettings();
}

// Simple loading spinner
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.needsPasswordChange) return <Navigate to="/change-password" replace />;
  return children;
};

// Simple caching - data stays fresh for 1 minute, cached for 5 minutes
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute fresh
      gcTime: 1000 * 60 * 5, // 5 minutes cache
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Component that preloads routes when user is logged in
function RoutePreloader() {
  const { user } = useAuth();

  useEffect(() => {
    if (user && !user.needsPasswordChange) {
      // Preload all routes after a short delay (to not block main thread)
      const timer = setTimeout(() => {
        preloadAllRoutes();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <RoutePreloader />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/change-password" element={<ForceChangeScreen />} />

          <Route element={<AppShell />}>
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
            <Route path="/matrix" element={<ProtectedRoute><MatrixScreen /></ProtectedRoute>} />
            <Route path="/report" element={<ProtectedRoute><ReportScreen /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardScreen /></ProtectedRoute>} />
            <Route path="/export" element={<ProtectedRoute><ExportScreen /></ProtectedRoute>} />

            <Route path="/arrears" element={<ProtectedRoute><ArrearsScreen /></ProtectedRoute>} />
            <Route path="/admin/in" element={<ProtectedRoute><InputInScreen /></ProtectedRoute>} />
            <Route path="/admin/out" element={<ProtectedRoute><InputOutScreen /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsScreen /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
