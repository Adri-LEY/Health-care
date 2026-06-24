import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode; // Typage standard React pour le contenu textuel/HTML interne
}

export default function Button({ children }: ButtonProps) {
  return (
    <button
      className={styles.button}
      type="submit" // Permet de déclencher l'événement onSubmit du formulaire parent
    >
      {children}
    </button>
  );
}