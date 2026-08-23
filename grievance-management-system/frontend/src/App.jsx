import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { APPLICANT_ROLES, ADMIN_ROLES } from "./utils/constants";

import Login from "./pages/Login";
import ApplicantDashboard from "./pages/ApplicantDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SubmitGrievance from "./pages/SubmitGrievance";
import MyComplaints from "./pages/MyComplaints";
import AdminComplaints from "./pages/AdminComplaints";
import ComplaintDetails from "./pages/ComplaintDetails";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

function RoleAwareDashboard() {
  const { user } = useAuth();
  return ADMIN_ROLES.includes(user.role) ? <AdminDashboard /> : <ApplicantDashboard />;
}

function LoginOrRedirect() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginOrRedirect />} />

            <Route path="/dashboard" element={
              <ProtectedRoute><RoleAwareDashboard /></ProtectedRoute>
            } />

            <Route path="/submit-grievance" element={
              <ProtectedRoute allowedRoles={APPLICANT_ROLES}><SubmitGrievance /></ProtectedRoute>
            } />

            <Route path="/my-complaints" element={
              <ProtectedRoute allowedRoles={APPLICANT_ROLES}><MyComplaints /></ProtectedRoute>
            } />

            <Route path="/complaints" element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminComplaints /></ProtectedRoute>
            } />

            <Route path="/complaints/:id" element={
              <ProtectedRoute><ComplaintDetails /></ProtectedRoute>
            } />

            <Route path="/notifications" element={
              <ProtectedRoute><Notifications /></ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
