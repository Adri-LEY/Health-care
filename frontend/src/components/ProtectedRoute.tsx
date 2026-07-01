import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // On vérifie si le token existe
  const token = localStorage.getItem('token');

  // Si le token n'existe pas, on redirige vers la page de connexion
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si le token existe, on autorise l'accès aux routes enfants
  return <Outlet />;
};

export default ProtectedRoute;