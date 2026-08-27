import DropdownMenu from './DropdownMenu';
import styles from './Header.module.css';
import { useNavigate } from 'react-router-dom';


type TokenPayload = {
  role?: string;
};

function getSpaceLabel(token: string | null) {
  if (!token) return '';

  try {
    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson) as TokenPayload;

    switch (payload.role) {
      case 'PATIENT':
        return 'Espace patient';
      case 'DOCTOR':
        return 'Espace médecin';
      case 'NURSE_ASSISTANT':
        return 'Espace aide-soignant';
      case 'ADMINISTRATOR':
        return 'Espace administrateur';
      default:
        return 'Espace utilisateur';
    }
  } catch {
    return 'Espace utilisateur';
  }
}

export default function Header() {
  const token = localStorage.getItem('token');
  const isConnected = Boolean(token);
  const spaceLabel = getSpaceLabel(token);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');       // Retour à la case départ (connexion)
  };

  const handleProfileClick = () => {
    navigate('/profile'); // Redirection vers la page de profil
  }

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <h3 className={styles.brand}>HealthManager</h3>
      {isConnected && <div className={styles.spaceLabel}>{spaceLabel}</div>}

      <div className={styles.rightNav}>
        <a href="/about" className={styles.headerAboutLink}>
          À propos
        </a>

        {isConnected && (
          <DropdownMenu
            triggerLabel="Mon compte"
            items={[
              {
                label: "Profil",
                onClick: handleProfileClick
              },
              {
                label: "Se déconnecter",
                onClick: handleLogout
              }
            ]}
          />
        )}
        
        {!isConnected && (
          <button
            className={`${styles.actionButton} ${styles.loginButton}`}
            onClick={handleLogin}
          >
            Se connecter
          </button>
        )}
      </div>
    </header>
  );
}