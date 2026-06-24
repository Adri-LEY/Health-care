import styles from './Header.module.css';

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

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    window.location.href = '/';       // Retour à la case départ (connexion)
  };

  const handleLogin = () => {
    window.location.href = '/';
  };

  return (
    <header className={styles.header}>
      <h3 className={styles.brand}>HealthManager</h3>
      {isConnected && <div className={styles.spaceLabel}>{spaceLabel}</div>}
      <button
        className={`${styles.actionButton} ${!isConnected ? styles.loginButton : ''}`}
        onClick={isConnected ? handleLogout : handleLogin}
      >
        {isConnected ? 'Déconnexion' : 'Se connecter'}
      </button>
    </header>
  );
}