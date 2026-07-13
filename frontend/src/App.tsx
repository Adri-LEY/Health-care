import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboards/Dashboard';
import Header from './components/Header';
import Profile from './pages/account/Profile';
import ForgotPassword from './pages/auth/passwordReset/ForgotPassword';
import ResetPassword from './pages/auth/passwordReset/ResetPassword';
import SignUp from './pages/auth/SignUp';
import ProtectedRoute from './components/ProtectedRoute';
import StaffList from './pages/admin-pages/staffList';
import AdminMenu from './pages/admin-pages/AdminMenu';
import AddStaff from './pages/admin-pages/addStaff';
import { ActivationAccount } from './pages/account/staffAccount/activationAccount';
import PatientResearch from './pages/doctor-pages/patientReseach';
import PatientMedicalRecord from './pages/doctor-pages/patientMedicalRecord';
import DoctorMenu from './pages/doctor-pages/DoctorMenu';

const RoleBasedRedirect = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // Si pas d'utilisateur connecté, on l'envoie se connecter
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Aiguillage selon le rôle exact de ton application
  switch (user.role) {
    case 'ADMINISTRATOR':
      return <Navigate to="/admin" replace />;
    case 'DOCTOR':
      return <Navigate to="/doctor" replace />; // (Exemple, change selon tes besoins)
    default:
      // Par défaut, les rôles classiques vont sur le dashboard général
      return <Navigate to="/dashboard" replace />;
  }
};


const AdminRoute = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  console.log('AdminRoute - user:', user);

  if (!user || user.role !== 'ADMINISTRATOR') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};


const DoctorRoute = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  console.log('DoctorRoute - user:', user);

  if (!user || user.role !== 'DOCTOR') {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

function AppContent() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="/" element={<RoleBasedRedirect />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/activate-account" element={<ActivationAccount />} />

        <Route path="/signup" element={<SignUp />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminMenu />} />

          <Route path="/admin/staffList" element={<StaffList />} />

          <Route path="/admin/addStaff" element={<AddStaff />} />
        </Route>


        <Route element={<DoctorRoute />}>
          <Route path="/doctor" element={<DoctorMenu />} />

          <Route path="/staff/patientResearch" element={<PatientResearch />} />
        </Route>
        

        <Route path="/staff/patientResearch" element={<PatientResearch />} />

        <Route path="/staff/patientMedicalRecord/:patientId" element={<PatientMedicalRecord />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;