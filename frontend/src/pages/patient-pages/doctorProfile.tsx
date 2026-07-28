import { useEffect, useState } from 'react';
import { type TimeSlotProps } from '../../components/DoctorPlanning/dateUtils';
import { useNavigate, useParams } from 'react-router-dom';
import { DoctorAvailabilities } from '../../components/DoctorPlanning/DoctorAvailabilities';
import { DoctorCard, type DoctorProfileData } from '../../components/DoctorPlanning/DoctorCard';
import styles from './doctorProfile.module.css';
import { ArrowLeft } from 'lucide-react';

export function DoctorProfile() {
    const doctorId = useParams<{ doctorId: string }>().doctorId;
    const [slots, setSlots] = useState<TimeSlotProps[]>([]);
    const [doctorData, setDoctorData] = useState<DoctorProfileData | null>(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const navigate = useNavigate();

    const getDoctorAvailabilities = async (id: number, dateQuery?: string) => {
        try {
            const response = await fetch(`${apiUrl}/appointments/doctor/${id}/availabilities${dateQuery ? `?date=${dateQuery}` : ''}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSlots(data.timeSlots);
            }
        } catch (error) {
            console.error('Error fetching doctor availabilities:', error);
        }
    };

    const getDoctorProfile = async (id: number) => {
        try {
            const response = await fetch(`${apiUrl}/staff/doctorProfile/${id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            console.log('Response from getDoctorProfile:', response);

            if (response.ok) {
                const data = await response.json();
                console.log('data', data);
                setDoctorData(data);
            }
            else {
                throw new Error(`Failed to fetch doctor profile: ${response.statusText}`);
            }


        } catch (error) {
            console.error('Error fetching doctor profile:', error);
        }
    };

    useEffect(() => {
        const parsedId = doctorId ? parseInt(doctorId) : 0;
        if (parsedId) {
            getDoctorAvailabilities(parsedId);
            getDoctorProfile(parsedId);
        }
    }, [doctorId]);

    return (
        <div className={styles.pageWrapper}>
            {/* Header avec bouton Retour et Titre */}
            <div className={styles.pageHeader}>
                <button 
                    type="button" 
                    className={styles.backButton} 
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={18} aria-hidden="true" />
                    Retour
                </button>
                
                <h2 className={styles.pageTitle}>Détails du Médecin</h2>
            </div>

            {/* Contenu principal */}
            <div className={styles.container}>     
                <DoctorCard doctor={doctorData} />
                <DoctorAvailabilities 
                    availableSlots={slots} 
                    onSelectSlot={(slot) => console.log('Selected slot:', slot)} 
                    maxRows={4} 
                />
            </div>
        </div>
    );
}