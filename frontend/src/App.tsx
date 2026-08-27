import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
import { BiometricsFormular } from './pages/nursePages/biometricsFormular';
import PatientManagement from './pages/admin-pages/patientManagement';
import {DoctorProfile} from './pages/patient-pages/doctorProfile';
import DoctorResearch from './pages/patient-pages/doctorResearch';
import { AppointmentsList } from './pages/patient-pages/appointments';
import DoctorPlanning from './pages/doctor-pages/planning';
import { PatientLayout } from './components/chatbot/PatientLayout';
import { ChatWidget } from './components/chatbot/ChatWidget';
import AdminDashboard from './pages/admin-pages/dashboard';
import DoctorDashboard from './pages/doctor-pages/DoctorDashboard';

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
  const location = useLocation();
  const [isPatient, setIsPatient] = useState(() => {
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const user = userString ? JSON.parse(userString) : null;
    return token && user?.role === 'PATIENT';
  });

  useEffect(() => {
    const checkPatient = () => {
      const userString = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      const user = userString ? JSON.parse(userString) : null;
      setIsPatient(token && user?.role === 'PATIENT');
    };

    // Vérifier à chaque changement de route
    checkPatient();

    // Écouter les changements du localStorage (utile pour les autres onglets)
    window.addEventListener('storage', checkPatient);

    return () => window.removeEventListener('storage', checkPatient);
  }, [location.pathname]);

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
          <Route path="/admin/patientManagement/:patientId" element={<PatientManagement />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* --- PATIENT --- */}
        <Route element={<AllowedRolesRoute allowedRoles={['PATIENT']} />}>
          <Route element={<PatientLayout />}>
            <Route path="/patient" element={<PatientMenu />} />
            <Route path="/doctor/:doctorId/profile" element={<DoctorProfile />} />
            <Route path="/my-appointments" element={<AppointmentsList />} />
          </Route>
        </Route>

        {/* --- MÉDECIN UNIQUEMENT --- */}
        <Route element={<AllowedRolesRoute allowedRoles={['DOCTOR']} />}>
          <Route path="/doctor" element={<DoctorMenu />} />
          <Route 
            path="/patient/medicalRecord/:medicalRecordId/add-consultation/:patientId" 
            element={<AddConsultation />} 
          />
          <Route path="/doctor/planning" element={<DoctorPlanning />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        </Route>

        {/* --- AIDE-SOIGNANT UNIQUEMENT --- */}
        <Route element={<AllowedRolesRoute allowedRoles={['NURSE_ASSISTANT']} />}>
          <Route path="/nurse" element={<NurseMenu />} />
          <Route path="/patient/medicalRecord/:medicalRecordId/biometrics" element={<BiometricsFormular/>} />
          <Route path="/doctor/:doctorId/planning" element={<DoctorPlanning />} />
        </Route>

        

        {/* --- ACCÈS PARTAGÉ : MÉDECIN ET AIDE-SOIGNANT --- */}
        <Route element={<AllowedRolesRoute allowedRoles={['DOCTOR', 'NURSE_ASSISTANT', 'ADMINISTRATOR']} />}>
          <Route path="/patientResearch" element={<PatientResearch />} />
        </Route>

        {/* --- ACCÈS PARTAGÉ : MÉDECIN, AIDE-SOIGNANT ET PATIENT --- */}
        <Route element={<AllowedRolesRoute allowedRoles={['DOCTOR', 'NURSE_ASSISTANT', 'PATIENT']} />}>
          <Route path="/patient/medicalRecord/:patientId" element={<PatientMedicalRecord />} />
          <Route path="/patient/medicalRecord/consultations/:medicalRecordId" element={<PatientConsultations />} />
          <Route path="/doctorResearch" element={<DoctorResearch />} />
        </Route>
      </Routes>

      {isPatient && <ChatWidget />}
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