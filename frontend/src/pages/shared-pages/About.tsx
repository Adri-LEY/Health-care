// About.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HeartPulse, ShieldCheck, CalendarDays, Stethoscope } from 'lucide-react';
import styles from './About.module.css';

export default function About() {
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <button type="button" onClick={() => navigate(-1)} className={styles.backButton}>
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Retour</span>
        </button>

        <h1 className={styles.title}>HealthManager</h1>
        <h2 className={styles.subtitle}>À propos de notre plateforme</h2>

        <div className={styles.content}>
          <p className={styles.description}>
            Bienvenue sur HealthManager. Notre application est conçue pour simplifier la gestion 
            du parcours de soin, offrant un écosystème collaboratif et intuitif tant pour les patients 
            que pour l'ensemble des professionnels de santé.
          </p>

          <div className={styles.featuresGrid}>
            {/* Point 1 : Personnel & Suivi */}
            <div className={styles.featureItem}>
              <Stethoscope className={styles.iconBlue} size={24} />
              <div>
                <h3>Outil du Personnel Soignant</h3>
                <p>
                  Conçu pour les équipes médicales (médecins, aides-soignants), le site permet un suivi 
                  clinique approfondi des patients et une centralisation des informations de santé au quotidien.
                </p>
              </div>
            </div>

            {/* Point 2 : Gestion des rdv & consultations */}
            <div className={styles.featureItem}>
              <CalendarDays className={styles.iconBlue} size={24} />
              <div>
                <h3>Rendez-vous & Consultations</h3>
                <p>
                  Planifiez facilement vos rendez-vous et accédez directement aux comptes-rendus ainsi 
                  qu'aux informations clés saisis lors de vos consultations sur le site.
                </p>
              </div>
            </div>

            {/* Point 3 : Sécurité */}
            <div className={styles.featureItem}>
              <ShieldCheck className={styles.iconGreen} size={24} />
              <div>
                <h3>Sécurisé & Conforme</h3>
                <p>La protection, le chiffrement et la confidentialité absolue de vos données médicales sont notre priorité absolue.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}