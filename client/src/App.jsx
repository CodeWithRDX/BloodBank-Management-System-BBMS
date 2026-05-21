import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { loadUser } from './redux/slices/authSlice';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Inventory from './pages/Inventory';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Unauthorized from './pages/Unauthorized';
import About from './pages/About';
import BloodBankLocator from './pages/BloodBankLocator';

// Admin Pages — existing
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminRequests from './pages/AdminRequests';
import AdminInventory from './pages/AdminInventory';
import AdminDonors from './pages/AdminDonors';
import AdminAppointments from './pages/AdminAppointments';

// Admin Pages — new
import AdminBranches from './pages/AdminBranches';
import AdminStaff from './pages/AdminStaff';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminCamps from './pages/AdminCamps';
import AdminTransfers from './pages/AdminTransfers';
import AdminLogs from './pages/AdminLogs';

// Donor Pages
import DonorDashboard from './pages/DonorDashboard';
import DonorProfile from './pages/DonorProfile';
import DonorAppointments from './pages/DonorAppointments';
import DonationHistory from './pages/DonationHistory';
import NewAppointment from './pages/NewAppointment';
import DonorCamps from './pages/DonorCamps';
import DonorEligibility from './pages/DonorEligibility';

// Hospital Pages
import HospitalDashboard from './pages/HospitalDashboard';
import HospitalRequests from './pages/HospitalRequests';
import NewBloodRequest from './pages/NewBloodRequest';
import HospitalInventorySearch from './pages/HospitalInventorySearch';

// Staff Pages
import StaffDashboard from './pages/StaffDashboard';
import StaffInventory from './pages/StaffInventory';
import StaffCamps from './pages/StaffCamps';

// Shared Dashboard Pages
import Notifications from './pages/Notifications';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }} 
      />
      
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/about" element={<About />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/locator" element={<BloodBankLocator />} />
        </Route>

        {/* Standalone pages (no layout) */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/donors" element={<AdminDonors />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/requests" element={<AdminRequests />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />
          <Route path="/admin/notifications" element={<Notifications />} />
          {/* New admin routes */}
          <Route path="/admin/branches" element={<AdminBranches />} />
          <Route path="/admin/staff" element={<AdminStaff />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          {/* Admin routes */}
          <Route path="/admin/camps" element={<AdminCamps />} />
          <Route path="/admin/transfers" element={<AdminTransfers />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
        </Route>

        {/* Donor Routes */}
        <Route element={<ProtectedRoute roles={['donor']}><DashboardLayout /></ProtectedRoute>}>
          <Route path="/donor" element={<DonorDashboard />} />
          <Route path="/donor/profile" element={<DonorProfile />} />
          <Route path="/donor/profile/edit" element={<DonorProfile />} />
          <Route path="/donor/donations" element={<DonationHistory />} />
          <Route path="/donor/appointments" element={<DonorAppointments />} />
          <Route path="/donor/appointments/new" element={<NewAppointment />} />
          <Route path="/donor/notifications" element={<Notifications />} />
          <Route path="/donor/camps" element={<DonorCamps />} />
          <Route path="/donor/eligibility" element={<DonorEligibility />} />
          <Route path="/locator" element={<BloodBankLocator />} />
        </Route>

        {/* Hospital Routes */}
        <Route element={<ProtectedRoute roles={['hospital']}><DashboardLayout /></ProtectedRoute>}>
          <Route path="/hospital" element={<HospitalDashboard />} />
          <Route path="/hospital/requests" element={<HospitalRequests />} />
          <Route path="/hospital/requests/new" element={<NewBloodRequest />} />
          <Route path="/hospital/search" element={<HospitalInventorySearch />} />
          <Route path="/hospital/notifications" element={<Notifications />} />
        </Route>

        {/* Staff Routes */}
        <Route element={<ProtectedRoute roles={['staff', 'branch_admin']}><DashboardLayout /></ProtectedRoute>}>
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/staff/notifications" element={<Notifications />} />
          <Route path="/staff/inventory" element={<StaffInventory />} />
          <Route path="/staff/camps" element={<StaffCamps />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'var(--bg-base)' }}>
            <div style={{ fontSize: '6rem', fontWeight: 900, color: 'var(--border)', fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>404</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Page not found</p>
            <a href="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.5rem' }}>← Go Home</a>
          </div>
        } />
      </Routes>
    </>
  );
}

export default App;
