import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import frLocale from '@fullcalendar/core/locales/fr';
import interactionPlugin from '@fullcalendar/interaction';
import styles from './planning.module.css';
import { ArrowLeft } from 'lucide-react';

// Couleurs personnalisées selon le statut du RDV
const STATUS_COLORS: Record<string, string> = {
    SCHEDULED: '#3b82f6', // Bleu (En attente / Planifié)
    CONFIRMED: '#22c55e', // Vert (Présent / Confirmé)
    MISSED: '#ef4444',  // Rouge (Absent / Annulé)
};

export default function DoctorPlanning() {
    const [events, setEvents] = useState<Record<string, unknown>[]>([]);

    const [error, setError] = useState<string | null>(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const fetchAppointments = async () => {
        try {
            const response = await fetch(`${apiUrl}/appointments/doctor/1/schedule`, {
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

                return {
                    id: item.id.toString(),
                    title: patientName,
                    start: item.timeSlot.startTime,
                    end: item.timeSlot.endTime,
                    backgroundColor: STATUS_COLORS[item.status] || '#6b7280',
                    borderColor: STATUS_COLORS[item.status] || '#6b7280',
                    extendedProps: {
                        status: item.status,
                        patient: item.patient.user,
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


    useEffect(() => {
        fetchAppointments();
    }, []);

    // Action au clic sur un rendez-vous
    const handleEventClick = (clickInfo: any) => {
        const { title, extendedProps } = clickInfo.event;
        alert(
            `RDV avec : ${title}\n` +
            `Téléphone : ${extendedProps.patient.phone}\n` +
            `Statut actuel : ${extendedProps.status}`
        );
    };

    return (
        <div className={styles.calendarWrapper}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => window.history.back()}>
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

                // --- HAUTEUR DYNAMIQUE ADAPTÉE À L'ÉCRAN ---
                height="calc(100vh - 180px)" 
                stickyHeaderDates={true}

                slotMinTime="07:00:00"
                slotMaxTime="20:00:00"
                scrollTime="08:00:00"

                slotDuration="00:30:00"
                slotLabelInterval="01:00"
                allDaySlot={false}

                events={events}

                eventContent={(eventInfo) => {
                    const patient = eventInfo.event.extendedProps?.patient;
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
        </div>
    );
}