import React from 'react';
import styles from './PatientCard.module.css';


export interface PatientCardProps {
    patient: any; // Remplacez 'any' par le type approprié si vous avez un type défini pour les patients
    onClick: () => void;
}


export default function PatientCard({ patient, onClick }: PatientCardProps) {
    console.log('Rendering PatientCard for patient:', patient);

    return (
        <div className={styles['patient-card']} onClick={onClick}>
            <span className={styles['patient-name']}>
                {patient.firstName} {patient.lastName}
            </span>
            <span className={styles['patient-gender-age']}>
                {patient.gender === 'M' ? 'Homme' : patient.gender === 'F' ? 'Femme' : 'Autre'} / {patient.age} ans
            </span>
            <span className={styles['patient-contact']}>
                {patient.email}
                <br />
                {patient.phone || 'Non renseigné'}
            </span>
            <span className={styles['patient-type']}>
                {patient.intern ? 'Interne' : 'Externe'}
            </span>
            <span className={styles['patient-status']}>
                {patient.dossierStatus || 'Statut inconnu'}
            </span>
        </div>
    );
}