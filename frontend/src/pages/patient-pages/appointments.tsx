import { useEffect, useState, useMemo } from 'react';
import { Calendar, Clock, Phone, ChevronDown, ChevronUp, AlertCircle, ArrowLeft } from 'lucide-react';
import { AppointmentCard } from '../../components/appointments/AppointmentCard';
import styles from './appointments.module.css';
import { Message } from '../../components/Message';
import { useNavigate } from 'react-router-dom';
import { PatientAppointmentDashboard } from '../../components/appointments/PatientAppointmentDashboard';
import type { PatientAppointmentStats } from '../../components/appointments/PatientAppointmentDashboard';

export function AppointmentsList() {
    const [appointmentsData, setAppointmentsData] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [loading, setLoading] = useState(true);
    const [appointmentStats, setAppointmentStats] = useState<PatientAppointmentStats | null>(null);

    const [cancelledMessageOpen, setCancelledMessageOpen] = useState(false);
    const [confirmCancelMessageOpen, setConfirmCancelMessageOpen] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const navigate = useNavigate();

    // 1. Récupération des rendez-vous
    const getAppointments = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/appointments/patient-appointments`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des rendez-vous');
            }

            const data = await response.json();
            setAppointmentsData(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAppointmentStats = async () => {
        try {
            const response = await fetch(`${apiUrl}/appointments/patient-appointments/stats`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des statistiques');
            }

            setAppointmentStats(await response.json());
        } catch (error) {
            console.error('Error fetching appointment stats:', error);
        }
    };

    // 2. Annulation d'un rendez-vous
    const handleCancelAppointment = async (id: number | null) => {
        if (!id) return;

        try {
            const response = await fetch(`${apiUrl}/appointments/cancel-appointment/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                // Mettre à jour l'état local ou rafraîchir la liste
                getAppointments();
                getAppointmentStats();
                setCancelledMessageOpen(true);
            } else {
                console.error("Échec de l'annulation");
            }
        } catch (error) {
            console.error("Erreur lors de l'annulation:", error);
        }
    };

    useEffect(() => {
        getAppointments();
        getAppointmentStats();
    }, []);

    // 3. Separation des rendez-vous (Prochain vs Futurs vs Passés)
    const { nextAppointment, upcomingAppointments, pastAppointments } = useMemo(() => {
        const now = new Date();

        // Filtre les RDV à venir non annulés
        const future = appointmentsData
            .filter((apt) => new Date(apt.timeSlot?.startTime || apt.dateTime) >= now && apt.status !== 'CANCELLED')
            .sort((a, b) =>
                new Date(a.timeSlot?.startTime || a.dateTime).getTime() -
                new Date(b.timeSlot?.startTime || b.dateTime).getTime()
            );

        // Filtre les RDV passés ou annulés
        const past = appointmentsData
            .filter((apt) => new Date(apt.timeSlot?.startTime || apt.dateTime) < now || apt.status === 'CANCELLED')
            .sort((a, b) =>
                new Date(b.timeSlot?.startTime || b.dateTime).getTime() -
                new Date(a.timeSlot?.startTime || a.dateTime).getTime()
            );

        return {
            nextAppointment: future[0] || null,
            upcomingAppointments: future.slice(1),
            pastAppointments: past,
        };
    }, [appointmentsData]);

    if (loading) {
        return <div className={styles.loading}>Chargement de vos rendez-vous...</div>;
    }

    return (
        <div className={styles.container}>

            <button className={styles.backButton} onClick={() => navigate('/')}>
                <ArrowLeft size={20} /> Retour
            </button>

            <header className={styles.header}>
                <h1 className={styles.title}>Mes rendez-vous</h1>
                <p className={styles.subtitle}>Gérez vos consultations médicales à venir et consultez votre historique.</p>
            </header>

            {appointmentStats && (
                <PatientAppointmentDashboard
                    stats={appointmentStats}
                    nextAppointment={nextAppointment}
                    onCancelNextAppointment={(id) => handleCancelAppointment(id)}
                />
            )}
            
            {/* 📅 2. AUTRES RDV À VENIR */}
            {upcomingAppointments.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Autres rendez-vous à venir</h2>
                    <div className={styles.list}>
                        {upcomingAppointments.map((item) => (
                            <AppointmentCard
                                key={item.id}
                                appointment={item}
                                onCancel={() => {
                                    setSelectedAppointmentId(item.id);
                                    setConfirmCancelMessageOpen(true);
                                }}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* 📜 3. HISTORIQUE DES ANCIENS RDV (REPLIABLE) */}
            {pastAppointments.length > 0 && (
                <section className={styles.historySection}>
                    <button
                        type="button"
                        className={styles.toggleHistoryBtn}
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        {showHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        {showHistory
                            ? "Masquer l'historique"
                            : `Voir les anciens rendez-vous ou annulés (${pastAppointments.length})`}
                    </button>

                    {showHistory && (
                        <div className={styles.list} style={{ marginTop: '16px' }}>
                            {pastAppointments.map((item) => (
                                <AppointmentCard
                                    key={item.id}
                                    appointment={item}
                                    onCancel={() => {
                                        setSelectedAppointmentId(item.id);
                                        setConfirmCancelMessageOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}


            <Message
                isOpen={cancelledMessageOpen}
                onClose={() => setCancelledMessageOpen(false)}
                title="Rendez-vous annulé"
                message="Votre rendez-vous a été annulé avec succès."
            />

            <Message
                isOpen={confirmCancelMessageOpen}
                onClose={() => setConfirmCancelMessageOpen(false)}
                onAction={() => {
                    handleCancelAppointment(selectedAppointmentId);
                    setConfirmCancelMessageOpen(false);
                }}
                title="Confirmation"
                icon={<AlertCircle size={32} color="#facc15" />}
                cancelButton={true}
                buttonText="Confirmer l'annulation"
                buttonColor="#f87171"
                message="Êtes-vous sûr de vouloir annuler ce rendez-vous ?"
            />
        </div>
    );
}