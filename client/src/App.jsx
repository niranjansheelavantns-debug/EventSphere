import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import ManageEvents from './pages/ManageEvents';
import BookingOverview from './pages/BookingOverview';
import Profile from './pages/Profile';

import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import EventApproval from './pages/admin/EventApproval';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 page-enter">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />

          <Route path="/events/create" element={<ProtectedRoute roles={['organizer','admin']}><CreateEvent /></ProtectedRoute>} />
          <Route path="/events/:id/edit" element={<ProtectedRoute roles={['organizer','admin']}><EditEvent /></ProtectedRoute>} />
          <Route path="/manage-events" element={<ProtectedRoute roles={['organizer','admin']}><ManageEvents /></ProtectedRoute>} />
          <Route path="/booking-overview" element={<ProtectedRoute roles={['organizer','admin']}><BookingOverview /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute roles={['admin']}><EventApproval /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e1b4b', color: '#e0e7ff', border: '1px solid #4338ca' },
            success: { iconTheme: { primary: '#818cf8', secondary: '#1e1b4b' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
