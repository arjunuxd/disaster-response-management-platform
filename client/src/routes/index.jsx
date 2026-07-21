import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import CitizenLayout from '../layouts/CitizenLayout';
import AdminLayout from '../components/admin/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import { PageLoader } from '../components/ui/Loader';

const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Unauthorized = lazy(() => import('../pages/Unauthorized'));
const NotFound = lazy(() => import('../pages/NotFound'));
const ServerError = lazy(() => import('../pages/ServerError'));

const PublicAlerts = lazy(() => import('../pages/PublicAlerts'));
const AlertDetails = lazy(() => import('../pages/AlertDetails'));
const PublicStats = lazy(() => import('../pages/PublicStats'));
const PublicShelters = lazy(() => import('../pages/PublicShelters'));
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));
const FAQ = lazy(() => import('../pages/FAQ'));
const Preparedness = lazy(() => import('../pages/Preparedness'));
const SafetyTips = lazy(() => import('../pages/SafetyTips'));
const Helplines = lazy(() => import('../pages/Helplines'));

const Dashboard = lazy(() => import('../pages/Dashboard'));
const DashboardShelters = lazy(() => import('../pages/DashboardShelters'));
const ReportIncident = lazy(() => import('../pages/ReportIncident'));
const MyReports = lazy(() => import('../pages/MyReports'));
const ReportDetails = lazy(() => import('../pages/ReportDetails'));
const Profile = lazy(() => import('../pages/Profile'));

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const ManageUsers = lazy(() => import('../pages/admin/ManageUsers'));
const ManageReports = lazy(() => import('../pages/admin/ManageReports'));
const ManageAlerts = lazy(() => import('../pages/admin/ManageAlerts'));
const ManageRiskZones = lazy(() => import('../pages/admin/ManageRiskZones'));
const ManageShelters = lazy(() => import('../pages/admin/ManageShelters'));
const ManageDisasterTypes = lazy(() => import('../pages/admin/ManageDisasterTypes'));
const ManageAuditLog = lazy(() => import('../pages/admin/ManageAuditLog'));
const SystemSettings = lazy(() => import('../pages/admin/SystemSettings'));
const Analytics = lazy(() => import('../pages/admin/Analytics'));
const MapPage = lazy(() => import('../pages/map'));
import { MapProvider } from '../context/map/MapContext';

const RouteSuspense = ({ children }) => (
  <Suspense fallback={<PageLoader text="Loading..." />}>
    {children}
  </Suspense>
);

const PublicMapLayout = () => (
  <MapProvider>
    <RouteSuspense>
      <MapPage />
    </RouteSuspense>
  </MapProvider>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Pages - Minimal split-screen layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<RouteSuspense><Login /></RouteSuspense>} />
        <Route path="/register" element={<RouteSuspense><Register /></RouteSuspense>} />
      </Route>

      {/* Public Pages - Navbar + Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<RouteSuspense><Home /></RouteSuspense>} />
        <Route path="/unauthorized" element={<RouteSuspense><Unauthorized /></RouteSuspense>} />
        <Route path="/alerts" element={<RouteSuspense><PublicAlerts /></RouteSuspense>} />
        <Route path="/alerts/:id" element={<RouteSuspense><AlertDetails /></RouteSuspense>} />
        <Route path="/statistics" element={<RouteSuspense><PublicStats /></RouteSuspense>} />
        <Route path="/shelters" element={<RouteSuspense><PublicShelters /></RouteSuspense>} />
        <Route path="/preparedness" element={<RouteSuspense><Preparedness /></RouteSuspense>} />
        <Route path="/safety" element={<RouteSuspense><SafetyTips /></RouteSuspense>} />
        <Route path="/helplines" element={<RouteSuspense><Helplines /></RouteSuspense>} />
        <Route path="/about" element={<RouteSuspense><About /></RouteSuspense>} />
        <Route path="/contact" element={<RouteSuspense><Contact /></RouteSuspense>} />
        <Route path="/faq" element={<RouteSuspense><FAQ /></RouteSuspense>} />
      </Route>

      {/* Public Map - Standalone with map provider */}
      <Route path="/map" element={<PublicMapLayout />} />

      {/* Citizen Pages - CitizenTopbar + CitizenSidebar */}
      <Route
        element={
          <ProtectedRoute>
            <CitizenLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<RouteSuspense><Dashboard /></RouteSuspense>} />
        <Route path="/reports" element={<RouteSuspense><MyReports /></RouteSuspense>} />
        <Route path="/reports/new" element={<RouteSuspense><ReportIncident /></RouteSuspense>} />
        <Route path="/reports/:id" element={<RouteSuspense><ReportDetails /></RouteSuspense>} />
        <Route path="/profile" element={<RouteSuspense><Profile /></RouteSuspense>} />
        <Route path="/dashboard/alerts" element={<RouteSuspense><PublicAlerts /></RouteSuspense>} />
        <Route path="/dashboard/alerts/:id" element={<RouteSuspense><AlertDetails /></RouteSuspense>} />
        <Route path="/dashboard/shelters" element={<RouteSuspense><DashboardShelters /></RouteSuspense>} />
        <Route path="/dashboard/map" element={<PublicMapLayout />} />
      </Route>

      {/* Admin Pages - AdminNavbar + AdminSidebar */}
      <Route
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<RouteSuspense><AdminDashboard /></RouteSuspense>} />
        <Route path="/admin/analytics" element={<RouteSuspense><Analytics /></RouteSuspense>} />
        <Route path="/admin/users" element={<RouteSuspense><ManageUsers /></RouteSuspense>} />
        <Route path="/admin/reports" element={<RouteSuspense><ManageReports /></RouteSuspense>} />
        <Route path="/admin/alerts" element={<RouteSuspense><ManageAlerts /></RouteSuspense>} />
        <Route path="/admin/risk-zones" element={<RouteSuspense><ManageRiskZones /></RouteSuspense>} />
        <Route path="/admin/shelters" element={<RouteSuspense><ManageShelters /></RouteSuspense>} />
        <Route path="/admin/disaster-types" element={<RouteSuspense><ManageDisasterTypes /></RouteSuspense>} />
        <Route path="/admin/audit-log" element={<RouteSuspense><ManageAuditLog /></RouteSuspense>} />
        <Route path="/admin/settings" element={<RouteSuspense><SystemSettings /></RouteSuspense>} />
      </Route>

      <Route path="/500" element={<RouteSuspense><ServerError /></RouteSuspense>} />
      <Route path="*" element={<RouteSuspense><NotFound /></RouteSuspense>} />
    </Routes>
  );
};

export default AppRoutes;
