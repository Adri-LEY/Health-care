import { useNavigate } from 'react-router-dom';
import styles from './PatientMenu.module.css';
import { useEffect, useState } from 'react';

export default function PatientMenu() {
    const navigate = useNavigate();

    const [patientId, setPatientId] = useState<number | null>(null);

    const fetchProfile = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const json = await response.json();
            console.log('Profil utilisateur récupéré :', json);

            console.log('Patient ID:', json.userDetails?.id);
            if (json.userDetails?.id) {
                setPatientId(json.userDetails.id);
            }
        } catch (error) {
            console.error("Erreur lors du chargement du profil utilisateur :", error);
        }
    };

    useEffect(() => {
        fetchProfile();

    }, []);

    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <h2 className={styles.title}>Bienvenue sur votre espace utilisateur</h2>
                <p className={styles.text}>
                    La connexion a réussi. Cet espace contiendra bientôt vos outils de santé spécifiques.
                </p>

                <button type="button" className={styles.button} onClick={() => navigate(`/patient/medicalRecord/${patientId}`)}>
                    Consulter mon dossier médical
                </button>
            </section>
        </main>
    );
}