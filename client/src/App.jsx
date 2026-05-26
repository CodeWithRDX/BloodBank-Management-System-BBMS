import { Routes, Route } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { loadUser } from './redux/slices/authSlice';

// Layouts (eager — always needed)
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AISupportWidget from './components/chat/AISupportWidget';

// ── Public Pages ─────────────────────────────────────────────
const Home              = lazy(() => import('./pages/Home'));
const Login             = lazy(() => import('./pages/Login'));
const Register          = lazy(() => import('./pages/Register'));
const Inventory         = lazy(() => import('./pages/Inventory'));
const ForgotPassword    = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword     = lazy(() => import('./pages/ResetPassword'));
const Unauthorized      = lazy(() => import('./pages/Unauthorized'));
const About             = lazy(() => import('./pages/About'));
const BloodBankLocator  = lazy(() => import('./pages/BloodBankLocator'));
const PublicCamps       = lazy(() => import('./pages/PublicCamps'));

// ── Admin Pages ───────────────────────────────────────────────
const AdminDashboard    = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers        = lazy(() => import('./pages/AdminUsers'));
const AdminRequests     = lazy(() => import('./pages/AdminRequests'));
const AdminInventory    = lazy(() => import('./pages/AdminInventory'));
const AdminDonors       = lazy(() => import('./pages/AdminDonors'));
const AdminAppointments = lazy(() => import('./pages/AdminAppointments'));
const AdminBranches     = lazy(() => import('./pages/AdminBranches'));
const AdminStaff        = lazy(() => import('./pages/AdminStaff'));
const AdminAnalytics    = lazy(() => import('./pages/AdminAnalytics'));
const AdminCamps        = lazy(() => import('./pages/AdminCamps'));
const AdminTransfers    = lazy(() => import('./pages/AdminTransfers'));
const AdminLogs         = lazy(() => import('./pages/AdminLogs'));

// ── Donor Pages ───────────────────────────────────────────────
const DonorDashboard    = lazy(() => import('./pages/DonorDashboard'));
const DonorProfile      = lazy(() => import('./pages/DonorProfile'));
const DonorAppointments = lazy(() => import('./pages/DonorAppointments'));
const DonationHistory   = lazy(() => import('./pages/DonationHistory'));
const NewAppointment    = lazy(() => import('./pages/NewAppointment'));
const DonorCamps        = lazy(() => import('./pages/DonorCamps'));
const DonorEligibility  = lazy(() => import('./pages/DonorEligibility'));

// ── Hospital Pages ────────────────────────────────────────────
const HospitalDashboard       = lazy(() => import('./pages/HospitalDashboard'));
const HospitalRequests        = lazy(() => import('./pages/HospitalRequests'));
const NewBloodRequest         = lazy(() => import('./pages/NewBloodRequest'));
const HospitalInventorySearch = lazy(() => import('./pages/HospitalInventorySearch'));

// ── Staff Pages ───────────────────────────────────────────────
const StaffDashboard    = lazy(() => import('./pages/StaffDashboard'));
const StaffInventory    = lazy(() => import('./pages/StaffInventory'));
const StaffCamps        = lazy(() => import('./pages/StaffCamps'));

// ── Shared ────────────────────────────────────────────────────
const Notifications     = lazy(() => import('./pages/Notifications'));

// ── Suspense fallback ─────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <div style={{
        width: 40, height: 40,
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin-slow 0.7s linear infinite',
      }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading…</p>
    </div>
  );
}

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
      
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/"                      element={<Home />} />
            <Route path="/login"                 element={<Login />} />
            <Route path="/register"              element={<Register />} />
            <Route path="/inventory"             element={<Inventory />} />
            <Route path="/about"                 element={<About />} />
            <Route path="/forgot-password"       element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/locator"               element={<BloodBankLocator />} />
            <Route path="/camps"                 element={<PublicCamps />} />
          </Route>

          {/* Standalone pages (no layout) */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/admin"                  element={<AdminDashboard />} />
            <Route path="/admin/users"            element={<AdminUsers />} />
            <Route path="/admin/donors"           element={<AdminDonors />} />
            <Route path="/admin/inventory"        element={<AdminInventory />} />
            <Route path="/admin/requests"         element={<AdminRequests />} />
            <Route path="/admin/appointments"     element={<AdminAppointments />} />
            <Route path="/admin/notifications"    element={<Notifications />} />
            <Route path="/admin/branches"         element={<AdminBranches />} />
            <Route path="/admin/staff"            element={<AdminStaff />} />
            <Route path="/admin/analytics"        element={<AdminAnalytics />} />
            <Route path="/admin/camps"            element={<AdminCamps />} />
            <Route path="/admin/transfers"        element={<AdminTransfers />} />
            <Route path="/admin/logs"             element={<AdminLogs />} />
          </Route>

          {/* Donor Routes */}
          <Route element={<ProtectedRoute roles={['donor']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/donor"                       element={<DonorDashboard />} />
            <Route path="/donor/profile"               element={<DonorProfile />} />
            <Route path="/donor/profile/edit"          element={<DonorProfile />} />
            <Route path="/donor/donations"             element={<DonationHistory />} />
            <Route path="/donor/appointments"          element={<DonorAppointments />} />
            <Route path="/donor/appointments/new"      element={<NewAppointment />} />
            <Route path="/donor/notifications"         element={<Notifications />} />
            <Route path="/donor/camps"                 element={<DonorCamps />} />
            <Route path="/donor/eligibility"           element={<DonorEligibility />} />
            <Route path="/locator"                     element={<BloodBankLocator />} />
          </Route>

          {/* Hospital Routes */}
          <Route element={<ProtectedRoute roles={['hospital']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/hospital"                element={<HospitalDashboard />} />
            <Route path="/hospital/requests"       element={<HospitalRequests />} />
            <Route path="/hospital/requests/new"   element={<NewBloodRequest />} />
            <Route path="/hospital/search"         element={<HospitalInventorySearch />} />
            <Route path="/hospital/notifications"  element={<Notifications />} />
          </Route>

          {/* Staff Routes */}
          <Route element={<ProtectedRoute roles={['staff', 'branch_admin']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/staff"               element={<StaffDashboard />} />
            <Route path="/staff/notifications" element={<Notifications />} />
            <Route path="/staff/inventory"     element={<StaffInventory />} />
            <Route path="/staff/camps"         element={<StaffCamps />} />
            <Route path="/admin/donors"        element={<AdminDonors />} />
            <Route path="/admin/transfers"     element={<AdminTransfers />} />
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
      </Suspense>
      <AISupportWidget />
    </>
  );
}

export default App;
