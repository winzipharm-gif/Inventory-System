import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StaffDashboard from './pages/StaffDashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Suppliers from './pages/Suppliers';
import Invoices from './pages/Invoices';
import Settings from './pages/Settings';
import AuditTrail from './pages/AuditTrail';
import Login from './pages/Login';

const LoadingSpinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--color-bg-app)' }}>
    <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
  </div>
);

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/* Renders the correct dashboard based on the user's role */
const DashboardSwitch = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <Dashboard /> : <StaffDashboard />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<ProtectedRoute><DashboardSwitch /></ProtectedRoute>} />
        <Route path="inventory" element={<ProtectedRoute adminOnly><Inventory /></ProtectedRoute>} />
        <Route path="sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
        <Route path="invoices" element={<ProtectedRoute adminOnly><Invoices /></ProtectedRoute>} />
        <Route path="suppliers" element={<ProtectedRoute adminOnly><Suppliers /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute adminOnly><Settings /></ProtectedRoute>} />
        <Route path="audit" element={<ProtectedRoute adminOnly><AuditTrail /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
