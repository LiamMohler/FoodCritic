import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import RestaurantsPage from './pages/RestaurantsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import RecentReviewsPage from './pages/RecentReviewsPage';
import { Toaster } from 'react-hot-toast';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />
            <Navbar />
            <main className="pt-16 pb-8">
              <Routes>
                <Route path="/" element={
                  <>
                    <LandingPage />
                  </>
                } />
                <Route path="/login" element={
                  <>
                    <LoginPage />
                  </>
                } />
                <Route path="/register" element={
                  <>
                    <RegisterPage />
                  </>
                } />
                <Route path="/home" element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                } />
                <Route path="/restaurants" element={<RestaurantsPage />} />
                <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
                <Route path="/recent-reviews" element={<RecentReviewsPage />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;