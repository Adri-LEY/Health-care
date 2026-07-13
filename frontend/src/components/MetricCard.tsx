import React from 'react';
import styles from './MetricCard.module.css';


interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  className?: string;
}

export function MetricCard({ icon, label, value, unit, className }: MetricCardProps) {
  return (
    <div className={`${styles.metricCard} ${className || ''}`}>
      {icon}
      <div className={styles.metricInfo}>
        <label>{label}</label>
        <p>{value} {unit && <span>{unit}</span>}</p>
      </div>
    </div>
  );
}