import styles from './Header.module.css';

export default function Header() {
  const isConnected = Boolean(localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token'); // On supprime le jeton de sécurité
    window.location.href = '/';       // Retour à la case départ (connexion)
  };

  const handleLogin = () => {
    window.location.href = '/';
  };

  return (
    <header className={styles.header}>
      <h3 className={styles.brand}>HealthManager</h3>
      <button
        className={`${styles.actionButton} ${!isConnected ? styles.loginButton : ''}`}
        onClick={isConnected ? handleLogout : handleLogin}
      >
        {isConnected ? 'Déconnexion' : 'Se connecter'}
      </button>
    </header>
  );
}