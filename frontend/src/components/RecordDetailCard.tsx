import React from 'react';
import styles from './RecordDetailCard.module.css';


interface DetailCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode; // Permet de passer du texte ou une div d'alerte
}

export function RecordDetailCard({ icon, title, children }: DetailCardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{icon} {title}</h3>
      {children}
    </div>
  );
}