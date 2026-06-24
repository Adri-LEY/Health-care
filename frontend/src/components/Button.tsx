import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode; 
}

export default function Button({ children }: ButtonProps) {
  return (
    <button
      className={styles.button}
      type="submit" 
    >
      {children}
    </button>
  );
}