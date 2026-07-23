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
import AdminMenu from './pages/admin-pages/adminMenu';
import AddStaff from './pages/admin-pages/addStaff';
import { ActivationAccount } from './pages/account/staffAccount/activationAccount';
import PatientResearch from './pages/shared-pages/patientReseach';
import PatientMedicalRecord from './pages/shared-pages/patientMedicalRecord';
import DoctorMenu from './pages/doctor-pages/DoctorMenu';
import PatientMenu from './pages/patient-pages/PatientMenu';
import PatientConsultations from './pages/shared-pages/patientConsultations';
import About from './pages/shared-pages/About';
import AddConsultation from './pages/doctor-pages/addConsultation';
import NurseMenu from './pages/nursePages/NurseMenu';

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
      return <Navigate to="/doctor" replace />;
    case 'PATIENT':
      return <Navigate to="/patient" replace />; 
    case 'NURSE_ASSISTANT':
      return <Navigate to="/nurse" replace />;
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

const PatientRoute = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  console.log('PatientRoute - user:', user);

  if (!user || user.role !== 'PATIENT') {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}


const NurseRoute = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  console.log('NurseRoute - user:', user);

  if (!user || user.role !== 'NURSE_ASSISTANT') {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

const AllowedRolesRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function AppContent() {
  return (
    <>
      <Header />

      <Routes>
        {/* --- ROUTES PUBLIQUES --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/activate-account" element={<ActivationAccount />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<About />} />

        {/* --- ROUTES COMMUNES CONNECTÉES --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<RoleBasedRedirect />} />
        </Route>

        {/* --- ADMINISTRATEUR --- */}
        <Route element={<AllowedRolesRoute allowedRoles={['ADMINISTRATOR']} />}>
          <Route path="/admin" element={<AdminMenu />} />
          <Route path="/admin/staffList" element={<StaffList />} />
          <Route path="/admin/addStaff" element={<AddStaff />} />
        </Route>

        {/* --- PATIENT --- */}
        <Route element={<AllowedRolesRoute allowedRoles={['PATIENT']} />}>
          <Route path="/patient" element={<PatientMenu />} />
        </Route>

        {/* --- MÉDECIN UNIQUEMENT --- */}
        <Route element={<AllowedRolesRoute allowedRoles={['DOCTOR']} />}>
          <Route path="/doctor" element={<DoctorMenu />} />
          <Route 
            path="/patient/medicalRecord/:medicalRecordId/add-consultation/:patientId" 
            element={<AddConsultation />} 
          />
        </Route>

        {/* --- AIDE-SOIGNANT UNIQUEMENT --- */}
        <Route element={<AllowedRolesRoute allowedRoles={['NURSE_ASSISTANT']} />}>
          <Route path="/nurse" element={<NurseMenu />} />
        </Route>

        {/* --- ACCÈS PARTAGÉ : MÉDECIN ET AIDE-SOIGNANT --- */}
        <Route element={<AllowedRolesRoute allowedRoles={['DOCTOR', 'NURSE_ASSISTANT']} />}>
          <Route path="/patientResearch" element={<PatientResearch />} />
          <Route path="/patient/medicalRecord/:patientId" element={<PatientMedicalRecord />} />
          <Route path="/patient/medicalRecord/consultations/:medicalRecordId" element={<PatientConsultations />} />
        </Route>
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