import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import frLocale from '@fullcalendar/core/locales/fr';
import interactionPlugin from '@fullcalendar/interaction';
import styles from './planning.module.css';
import { ArrowLeft, Circle, CircleDot, Mail, Phone, User } from 'lucide-react';
import PatientCard from '../../components/PatientCard';
import { useNavigate, useParams } from 'react-router-dom';
import { UserCheck, FileText, X } from 'lucide-react';

// Couleurs personnalisées selon le statut du RDV
const STATUS_COLORS: Record<string, string> = {
    SCHEDULED: '#3b82f6', // Bleu (En attente / Planifié)
    CONFIRMED: '#22c55e', // Vert (Présent / Confirmé)
    MISSED: '#ef4444',  // Rouge (Absent / Annulé)
};

export default function DoctorPlanning() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    let doctorId = user.doctorId || null;
    if (user.role == 'NURSE_ASSISTANT') {
        doctorId = useParams<{ doctorId: string }>().doctorId;
    }


    const [events, setEvents] = useState<Record<string, unknown>[]>([]);

    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);

    const navigate = useNavigate();

    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);

    const [showPatientDetails, setShowPatientDetails] = useState(false);

    const [appointmentStatusCheck, setAppointmentStatusCheck] = useState<boolean | null>(false);

    const [error, setError] = useState<string | null>(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const fetchAppointments = async () => {
        const cleanDate = startDate?.split('T')[0];
        const query = `?date=${cleanDate}`;

        try {
            const response = await fetch(`${apiUrl}/appointments/doctor/${doctorId}/schedule${query}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const dataFromBack: any[] = await response.json();
            console.log('Données récupérées du backend :', dataFromBack);

            // Conversion des données au format FullCalendar
            const formattedEvents = dataFromBack.map((item) => {
                const patientName = `${item.patient.user.firstName} ${item.patient.user.lastName}`;

                console.log('item:', item);

                return {
                    id: item.id.toString(),
                    title: patientName,
                    start: item.timeSlot.startTime,
                    end: item.timeSlot.endTime,
                    backgroundColor: STATUS_COLORS[item.status] || '#6b7280',
                    borderColor: STATUS_COLORS[item.status] || '#6b7280',
                    extendedProps: {
                        id: item.id,
                        status: item.status,
                        patient: item.patient,
                        timeSlotId: item.timeSlot.id,
                    },
                };
            });

            setEvents(formattedEvents);
        }
        catch (error) {
            console.error("Erreur lors de la récupération des rendez-vous :", error);
        }
    };


    const handlePresenceConfirmation = async (isPresent: boolean) => {
        if (!selectedAppointment) return;

        try {
            const response = await fetch(`${apiUrl}/appointments/set-appointment-presence/${selectedAppointment.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ isPresent }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
            }

            setSelectedAppointment((prev: any) => ({
                ...prev,
                status: isPresent ? 'CONFIRMED' : 'MISSED',
            }));
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la présence :", error);
        }
    };

    useEffect(() => {
        setAppointmentStatusCheck(false); // Reset the check state after handling
        fetchAppointments();
    }, [startDate, endDate, appointmentStatusCheck]); // Re-fetch when the displayed date range changes

    // Action au clic sur un rendez-vous
    const handleEventClick = (clickInfo: any) => {
        const { title, extendedProps } = clickInfo.event;
        setShowPatientDetails(true);
        setSelectedPatient(extendedProps.patient);
        setSelectedAppointment(extendedProps);
        console.log(`Rendez-vous sélectionné : ${title}`);
        console.log('Détails du patient :', extendedProps.patient);
        console.log('ID du créneau horaire :', extendedProps.timeSlotId);
    };

    return (
        <div className={styles.calendarWrapper}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() =>navigate('/')}>
                    <ArrowLeft size={16} /> Retour
                </button>
                <h1 className={styles.title}>Mon Planning</h1>
                <div className={styles.headerSpacer}></div>
            </div>

            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                locale={frLocale}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}

                datesSet={(dateInfo) => {
                    console.log("Dates affichées :", dateInfo.startStr, "à", dateInfo.endStr);
                    setStartDate(dateInfo.startStr); // Date de début de la vue affichée
                    setEndDate(dateInfo.endStr);     // Date de fin de la vue affichée
                }}

                // --- HAUTEUR DYNAMIQUE ADAPTÉE À L'ÉCRAN ---
                height="calc(100vh - 180px)"
                stickyHeaderDates={true}

                slotMinTime="07:00:00"
                slotMaxTime="20:00:00"
                scrollTime="08:00:00"

                slotDuration="00:30:00"
                slotLabelInterval="01:00"
                allDaySlot={false}

                eventClick={handleEventClick}

                events={events}

                eventContent={(eventInfo) => {
                    const patient = eventInfo.event.extendedProps?.patient.user;
                    const name = patient
                        ? `${patient.firstName} ${patient.lastName}`
                        : eventInfo.event.title;

                    return (
                        <div className={styles.eventCardContent}>
                            <span className={styles.eventTime}>{eventInfo.timeText}</span>
                            <strong className={styles.eventTitle}>{name}</strong>
                        </div>
                    );
                }}
            />

            {error && <div className={styles.error}>{error}</div>}

            {showPatientDetails && (
                <div className={styles.modalOverlay} onClick={() => setShowPatientDetails(false)}>
                    <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>

                        {/* En-tête de la Modale */}
                        <div className={styles.modalHeader}>
                            <h3>Détails du Rendez-vous</h3>
                            <button
                                className={styles.closeIconButton}
                                onClick={() => setShowPatientDetails(false)}
                                title="Fermer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Badge du Statut du RDV */}
                        {selectedAppointment && (
                            <div className={styles.statusBadge} data-status={selectedAppointment.status}>
                                {selectedAppointment.status === 'CONFIRMED' && (<><Circle size={16} color="green" fill='green' /> Patient Présent</>)}
                                {selectedAppointment.status === 'SCHEDULED' && (<><CircleDot size={16} color="blue" fill='blue' /> Rendez-vous Planifié</>)}
                                {selectedAppointment.status === 'MISSED' && (<><CircleDot size={16} color="red" fill='red' /> Patient Absent</>)}
                            </div>
                        )}

                        {/* Informations Patient */}
                        <div className={styles.patientGrid}>
                            <div className={styles.infoGroup}>
                                <span className={styles.infoLabel}>Patient</span>
                                <span className={styles.infoValue}>
                                    <User size={16} color="gray" /> {selectedPatient ? `${selectedPatient.user.firstName} ${selectedPatient.user.lastName}` : 'Nom inconnu'}
                                </span>
                            </div>

                            <div className={styles.infoGroup}>
                                <span className={styles.infoLabel}>Téléphone</span>
                                <span className={styles.infoValue}>
                                    <Phone size={16} color="red" /> {selectedPatient?.user.phone || 'Non renseigné'}
                                </span>
                            </div>

                            <div className={styles.infoGroup}>
                                <span className={styles.infoLabel}>Email</span>
                                <span className={styles.infoValue}>
                                    <Mail size={16} color="blue" /> {selectedPatient?.user.email || 'Non renseigné'}
                                </span>
                            </div>
                        </div>

                        {/* Actions de l'Aide-Soignant */}
                        <div className={styles.modalActions}>
                            {/* Affiché uniquement si le RDV n'est pas encore confirmé */}
                            {selectedAppointment?.status && ['SCHEDULED', 'MISSED', 'CONFIRMED'].includes(selectedAppointment.status) && user.role === 'NURSE_ASSISTANT' && (

                                <>

                                    {['SCHEDULED', 'CONFIRMED'].includes(selectedAppointment.status) && (
                                        <button
                                            className={styles.confirmMissedButton}
                                            onClick={() => {
                                                setAppointmentStatusCheck(true);
                                                handlePresenceConfirmation(false);
                                            }}
                                        >
                                            <X size={18} color="red" />
                                            Marquer comme Absent
                                        </button>
                                    )}

                                    {['SCHEDULED', 'MISSED'].includes(selectedAppointment.status) && (
                                        <button
                                            className={styles.confirmPresenceButton}
                                            onClick={() => {
                                                setAppointmentStatusCheck(true);
                                                handlePresenceConfirmation(true);
                                            }}
                                        >
                                            <UserCheck size={18} color="green" />
                                            Confirmer la Présence
                                        </button>
                                    )}
                                </>
                            )}

                            {selectedAppointment?.status === 'CONFIRMED' && (
                                <div className={styles.confirmedMessage}>
                                    <UserCheck size={18} color="green" />
                                    La présence du patient a été confirmée.
                                </div>
                            )}

                            {selectedAppointment?.status === 'MISSED' && (
                                <div className={styles.missedMessage}>
                                    <X size={18} color="red" />
                                    Le patient était absent.
                                </div>
                            )}

                            {selectedAppointment?.status === 'CANCELLED' && (
                                <div className={styles.cancelledMessage}>
                                    <X size={18} color="red" />
                                    Le rendez-vous a été annulé.
                                </div>
                            )}

                            {/* Accès Direct au Dossier Médical */}
                            <button
                                className={styles.medicalRecordButton}
                                onClick={() => navigate(`/patient/medicalRecord/${selectedPatient?.id}`, { state: { returnTo: '/doctor/planning' } })}
                            >
                                <FileText size={18} />
                                Dossier Médical
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}