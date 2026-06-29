import React from 'react';
import styles from './SubmitButton.module.css';

interface ButtonProps {
  children: React.ReactNode; 
  onClick?: () => void; // Optionnel : si tu veux gérer un clic
}

export default function SubmitButton({ children, onClick }: ButtonProps) {
  return (
    <button
      className={styles.button}
      type="submit"
      onClick={onClick}
    >
      {children}
    </button>
  );
}