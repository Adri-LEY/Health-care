import React from 'react';
import { User, FileText, Contact } from 'lucide-react';
import styles from './PatientSideBar.module.css';


// PatientSidebar.tsx
interface SidebarProps {
    patient: {
        id: number;
        age: number;
        gender: string;
        birthDate: string;
        address: string;
        intern: boolean;
        user?: { firstName: string; lastName: string; email: string; phone: string; };
    };
}

export function PatientSidebar({ patient }: SidebarProps) {
    return (
        <div className={styles.card}>
            <div className={styles.profileHeader}>
                <div className={styles.avatar}>
                    {patient.user?.firstName[0]}{patient.user?.lastName[0]}
                </div>
                <h2>{patient.user?.firstName} {patient.user?.lastName}</h2>
                <span className={patient.intern ? styles.tagIntern : styles.tagExtern}>
                    {patient.intern ? 'Patient Interne' : 'Patient Externe'}
                </span>
            </div>

            <div className={styles.infoList}>
                <div className={styles.infoItem}>
                    <User size={16} />
                    <span>{patient.age} ans ({patient.gender === 'M' ? 'Homme' : 'Femme'})</span>
                </div>
                <div className={styles.infoItem}>
                    <FileText size={16} />
                    <span>Né(e) le {new Date(patient.birthDate).toLocaleDateString()}</span>
                </div>
                <div className={styles.infoItem}>
                    <Contact size={16} />
                    <span>{patient.user?.email}</span>
                </div>
                <div className={styles.infoLine}>
                    <strong>Adresse:</strong>
                    <p>{patient.address}</p>
                </div>
            </div>
        </div>
    );
}