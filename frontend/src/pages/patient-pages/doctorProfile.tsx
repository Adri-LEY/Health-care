import { useEffect, useState } from 'react';
import { type TimeSlotProps, getMonday, toDateKey } from '../../components/DoctorPlanning/dateUtils';
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

    // 💡 1. État pour la date de début (Lundi) de la semaine visualisée
    const [currentMonday, setCurrentMonday] = useState<Date>(() => getMonday(new Date()));
    console.log("new Date():", new Date());
    console.log("Initial currentMonday:", currentMonday, "for doctorId:", doctorId);

    const [selectedSlot, setSelectedSlot] = useState<TimeSlotProps | null>(null);

    const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
    const [successMessageOpen, setSuccessMessageOpen] = useState(false);
    const [errorMessageOpen, setErrorMessageOpen] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const navigate = useNavigate();

    const getDoctorAvailabilities = async (id: number, dateQuery?: string) => {
        console.log(`Fetching availabilities for doctor ${id} with date query: ${dateQuery}`);

        try {
            console.log(`Fetching availabilities for doctor ${id} with date query: ${dateQuery}`);

            const url = `${apiUrl}/appointments/doctor/${id}/availabilities${dateQuery ? `?date=${dateQuery}` : ''}`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                console.log(`Availabilities for doctor ${id}:`, data.timeSlots);
                setSlots(data.timeSlots || []);
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
                setSuccessMessageOpen(true);
            } else {
                setErrorMessageOpen(true);
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
            setErrorMessageOpen(true);
        }
    };

    const getDoctorProfile = async (id: number) => {
        try {
            const response = await fetch(`${apiUrl}/staff/doctorProfile/${id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.ok) {
                const data = await response.json();
                setDoctorData(data);
            }
        } catch (error) {
            console.error('Error fetching doctor profile:', error);
        }
    };

    // Charger les infos du médecin une seule fois au montage
    useEffect(() => {
        const parsedId = doctorId ? parseInt(doctorId) : 0;
        if (parsedId) {
            getDoctorProfile(parsedId);
        }
    }, [doctorId]);

    // 💡 2. Recharger les créneaux dès que la semaine change ou après un RDV confirmé
    useEffect(() => {
        const parsedId = doctorId ? parseInt(doctorId) : 0;
        if (parsedId) {
            // Transmet la date au format YYYY-MM-DD (ex: 2026-08-03)
            console.log("currentMonday:", currentMonday);
            const formattedDate = toDateKey(currentMonday);
            console.log(`Fetching availabilities for doctor ${parsedId} for week starting on ${formattedDate}`);
            getDoctorAvailabilities(parsedId, formattedDate);
        }
    }, [doctorId, currentMonday, successMessageOpen]);

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.pageHeader}>
                <button 
                    type="button" 
                    className={styles.backButton} 
                    onClick={() => navigate("doctorResearch")}
                >
                    <ArrowLeft size={18} aria-hidden="true" />
                    Retour
                </button>
                <h2 className={styles.pageTitle}>Détails du Médecin</h2>
            </div>

            <div className={styles.container}>     
                <DoctorCard doctor={doctorData} />
                
                {/* 💡 3. Transmettre currentMonday et onWeekChange */}
                <DoctorAvailabilities 
                    availableSlots={slots} 
                    currentMonday={currentMonday}
                    onWeekChange={(newMonday) => setCurrentMonday(newMonday)}
                    onSelectSlot={(slot) => {
                        setSelectedSlot(slot);
                        setAppointmentModalOpen(true);
                    }} 
                    maxRows={4} 
                />
            </div>

            <AppointmentModal
                isOpen={appointmentModalOpen}
                date={selectedSlot ? new Date(selectedSlot.date) : new Date()}
                startTime={selectedSlot ? new Date(selectedSlot.startTime) : new Date()}
                endTime={selectedSlot ? new Date(selectedSlot.endTime) : new Date()}
                doctorName={doctorData?.staff?.user?.firstName && doctorData?.staff?.user?.lastName ? `${doctorData.staff.user.firstName} ${doctorData.staff.user.lastName}` : undefined}
                specialtyName={doctorData?.specialty?.specialtyName}
                onClose={() => setAppointmentModalOpen(false)}
                onConfirm={() => {
                    createAppointment(doctorData?.id || 0, selectedSlot?.id || 0);
                    setAppointmentModalOpen(false);
                }}
            />

            <Message
                isOpen={successMessageOpen}
                title="Rendez-vous confirmé !"
                message={`Votre rendez-vous a été confirmé pour le ${selectedSlot ? new Date(selectedSlot.date).toLocaleDateString() : ''}.`}
                buttonText="OK"
                onClose={() => setSuccessMessageOpen(false)}
            />

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