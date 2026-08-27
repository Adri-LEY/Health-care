import React from 'react';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h2 className={styles.title}>Bienvenue sur votre espace utilisateur</h2>
        <p className={styles.text}>
          La connexion a réussi. Cet espace contiendra bientôt vos outils de santé spécifiques.
        </p>
      </section>
    </main>
  );
}