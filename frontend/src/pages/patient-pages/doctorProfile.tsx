import { useEffect, useState } from 'react';
import { type TimeSlotProps } from '../../components/DoctorPlanning/dateUtils';
import { useNavigate, useParams } from 'react-router-dom';
import { DoctorAvailabilities } from '../../components/DoctorPlanning/DoctorAvailabilities';
import { DoctorCard, type DoctorProfileData } from '../../components/DoctorPlanning/DoctorCard';
import styles from './doctorProfile.module.css';
import { ArrowLeft } from 'lucide-react';
import { AppointmentModal } from '../../components/appointments/AppointmentModal';
import { Message } from '../../components/Message';

export function DoctorProfile() {
    const doctorId = useParams<{ doctorId: string }>().doctorId;
    const [slots, setSlots] = useState<TimeSlotProps[]>([]);
    const [doctorData, setDoctorData] = useState<DoctorProfileData | null>(null);

    const [selectedSlot, setSelectedSlot] = useState<TimeSlotProps | null>(null);

    const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
    const [successMessageOpen, setSuccessMessageOpen] = useState(false);
    const [errorMessageOpen, setErrorMessageOpen] = useState(false);

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

    const createAppointment = async (doctorId: number, timeSlotId: number) => {
        try {
            const response = await fetch(`${apiUrl}/appointments/create-appointment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ doctorId, timeSlotId })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Appointment created:', data);
                
                setSuccessMessageOpen(true); // Affiche le message de succès
            } else {
                const errorData = await response.json();
                console.error('Error creating appointment:', errorData);
            }
        } catch (error) {
            console.error('Error creating appointment:', error);

            setSuccessMessageOpen(false); // Cache le message de succès en cas d'erreur
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
    }, [doctorId, successMessageOpen]); // Ajout de successMessageOpen pour recharger les disponibilités après la confirmation du rendez-vous

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
                    onSelectSlot={(slot) => {
                        setSelectedSlot(slot);
                        setAppointmentModalOpen(true);
                    }} 
                    maxRows={4} 
                />
            </div>

            {/* Modal de confirmation de rendez-vous */}
            <AppointmentModal
                isOpen={appointmentModalOpen}
                date={selectedSlot ? new Date(selectedSlot.date) : new Date()}
                startTime={selectedSlot ? new Date(selectedSlot.startTime) : new Date()}
                endTime={selectedSlot ? new Date(selectedSlot.endTime) : new Date()}
                doctorName={doctorData?.staff?.user?.firstName && doctorData?.staff?.user?.lastName ? `${doctorData.staff.user.firstName} ${doctorData.staff.user.lastName}` : undefined}
                specialtyName={doctorData?.specialty?.specialtyName}
                onClose={() => setAppointmentModalOpen(false)}
                onConfirm={() => {
                    // Logique pour confirmer le rendez-vous
                    console.log('Rendez-vous confirmé pour le créneau :', selectedSlot);
                    createAppointment(doctorData?.id || 0, selectedSlot?.id || 0);
                    setAppointmentModalOpen(false);
                }}
            />

            {/* Message de succès après la confirmation du rendez-vous */}
            <Message
                isOpen={successMessageOpen}
                title="Rendez-vous confirmé !"
                message={`Votre rendez-vous avec Dr. ${doctorData?.staff?.user?.firstName} ${doctorData?.staff?.user?.lastName} a été confirmé pour le ${selectedSlot ? new Date(selectedSlot.date).toLocaleDateString() : ''} à ${selectedSlot ? new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}.`}
                buttonText="OK"
                onClose={() => setSuccessMessageOpen(false)}
            />

            {/* Message d'erreur si la confirmation du rendez-vous échoue */}
            <Message
                isOpen={errorMessageOpen}
                title="Erreur lors de la confirmation"
                message="Une erreur est survenue lors de la confirmation de votre rendez-vous. Veuillez réessayer."
                buttonText="OK"
                onClose={() => setErrorMessageOpen(false)}
            />
        </div>
    );
}