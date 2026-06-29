import React from 'react';
import styles from './ReadOnlyField.module.css';

interface InformationFieldProps {
  label: string;
  value: string | number;
}

export default function ReadOnlyField({ label, value }: InformationFieldProps) {
  return (
    <div className={styles.readOnlyField}>
      <span className={styles.readOnlyLabel}>{label}</span>
      <div className={styles.readOnlyValue}>{value}</div>
    </div>
  );
}