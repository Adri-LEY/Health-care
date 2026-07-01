import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboards/Dashboard';
import Header from './components/Header';
import Profile from './pages/account/Profile';
import ForgotPassword from './pages/auth/passwordReset/ForgotPassword';
import ResetPassword from './pages/auth/passwordReset/ResetPassword';
import SignUp from './pages/auth/SignUp';
import ProtectedRoute from './components/ProtectedRoute';


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

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/signup" element={<SignUp />} />
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