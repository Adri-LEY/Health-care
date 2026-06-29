import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Profile from './pages/Profile';


function AppContent() {
  return (
    <>
      <Header />
      
      <Routes>
        {/* Route 1 : La racine du site affiche la page de Connexion */}
        <Route path="/" element={<Login />} />
        
        {/* Route 2 : L'URL /dashboard affichera l'espace utilisateur */}
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/profile" element={<Profile />} />
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