import React from 'react';
import styles from './IMCGaugeBar.module.css';

interface IMCGaugeBarProps {
  bmi: number;
}

export function IMCGaugeBar({ bmi }: IMCGaugeBarProps) {
  // Bornes de la jauge : IMC 15 (0%) à IMC 40 (100%)
  const minBmi = 15;
  const maxBmi = 40;
  const percentage = Math.min(Math.max(((bmi - minBmi) / (maxBmi - minBmi)) * 100, 0), 100);

  // Détermination de la couleur du curseur
  let color = '#22c55e'; // Vert par défaut
  if (bmi < 18.5) color = '#3b82f6';      // Insuffisance (Bleu)
  else if (bmi < 25) color = '#22c55e';   // Normal (Vert)
  else if (bmi < 30) color = '#eab308';   // Surpoids (Jaune)
  else if (bmi < 35) color = '#f97316';   // Obésité modérée (Orange)
  else color = '#ef4444';                 // Obésité sévère (Rouge)

  return (
    <div className={styles.gaugeContainer}>
      <div className={styles.gaugeTrack}>
        <div className={`${styles.zone} ${styles.underweight}`} title="< 18.5" />
        <div className={`${styles.zone} ${styles.normal}`} title="18.5 - 24.9" />
        <div className={`${styles.zone} ${styles.overweight}`} title="25 - 29.9" />
        <div className={`${styles.zone} ${styles.obese}`} title=">= 30" />

        {/* Curseur de la valeur actuelle */}
        <div 
          className={styles.cursor} 
          style={{ left: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <div className={styles.ticks}>
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
      </div>
    </div>
  );
}