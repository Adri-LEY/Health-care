import { useNavigate } from 'react-router-dom';
import styles from './adminMenu.module.css';

export default function AdminMenu() {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h2 className={styles.title}>Bienvenue sur votre espace utilisateur</h2>
        <p className={styles.text}>
          La connexion a réussi. Cet espace contiendra bientôt vos outils de santé spécifiques.
        </p>

        <button type="button" className={styles.button} onClick={() => navigate('/admin/staffList')}>
          Gérer le personnel
        </button>
      </section>
    </main>
  );
}