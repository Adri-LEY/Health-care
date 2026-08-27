import styles from './patientManagement.module.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { PatientSideBar } from '../../components/PatientSideBar';
import { UserCheck, UserX, Search, ArrowLeft } from 'lucide-react';

interface PatientProfile {
    id: number;
    age: number;
    gender: string;
    birthDate: string;
    address: string;
    intern: boolean;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    doctor?: {
        id: number;
        staff?: {
            user: {
                id: number;
                firstName: string;
                lastName: string;
                email: string;
                phone: string;
            };
        };
    };
}

interface DoctorStaffMember {
    id: number;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    };
    doctor?: {
        id: number;
        specialty?: {
            specialtyName: string;
        };
    };
}

export default function PatientManagement() {
    const { patientId } = useParams<{ patientId: string }>();
    const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
    const [doctors, setDoctors] = useState<DoctorStaffMember[]>([]);
    const [searchDoctorTerm, setSearchDoctorTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const getPatientProfile = async () => {
        try {
            const response = await fetch(`${apiUrl}/patients/${patientId}/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();
            setPatientProfile(data.data);
        } catch (error) {
            console.error('Error fetching patient profile:', error);
        }
    };

    const fetchDoctors = async () => {
        try {
            const res = await fetch(`${apiUrl}/staff/getAllStaff`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                const doctorsOnly = data.filter((m: any) => m.user?.role === 'DOCTOR');
                setDoctors(doctorsOnly);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des médecins:", error);
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([getPatientProfile(), fetchDoctors()]);
            setLoading(false);
        };
        init();
    }, [patientId]);

    const handleAssignDoctor = async (doctorId: number) => {
        try {
            const res = await fetch(`${apiUrl}/patients/assignDoctor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ patientId: Number(patientId), doctorId })
            });
            if (!res.ok) throw new Error("Erreur lors de l'affectation");
            await getPatientProfile();
        } catch (err) {
            console.error("Erreur d'affectation :", err);
            alert("Impossible d'affecter ce médecin.");
        }
    };

    const handleUnassignDoctor = async () => {
        try {
            const res = await fetch(`${apiUrl}/patients/unassignDoctor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ patientId: Number(patientId) })
            });
            if (!res.ok) throw new Error("Erreur lors de la désaffectation");
            await getPatientProfile();
        } catch (err) {
            console.error("Erreur de désaffectation :", err);
            alert("Impossible de désaffecter le médecin.");
        }
    };

    const filteredDoctors = useMemo(() => {
        const term = searchDoctorTerm.toLowerCase().trim();
        if (!term) return doctors;
        return doctors.filter(doc => {
            const fullName = `${doc.user.firstName} ${doc.user.lastName}`.toLowerCase();
            const spec = doc.doctor?.specialty?.specialtyName?.toLowerCase() || '';
            return fullName.includes(term) || spec.includes(term);
        });
    }, [doctors, searchDoctorTerm]);

    if (loading || !patientProfile) {
        return <div className={styles.loading}>Chargement...</div>;
    }

    const assignedDoctor = patientProfile.doctor?.staff?.user;

    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>
                <ArrowLeft /> Retour
            </button>
            <h1 className={styles.title}>Gestion du patient</h1>

            <div className={styles.managementGrid}>
                {/* Colonne gauche : Sidebar Patient */}
                <PatientSideBar patient={patientProfile} />

                {/* Colonne droite : Affectation du Médecin par l'Admin */}
                <div className={styles.assignmentCard}>
                    <h2>Affectation du Médecin Traitant</h2>

                    {assignedDoctor ? (
                        <div className={styles.assignedDoctorBox}>
                            <p className={styles.assignedDoctorName}>
                                Médecin actuellement affecté : Dr. {assignedDoctor.firstName} {assignedDoctor.lastName}
                            </p>
                            <p className={styles.assignedDoctorEmail}>
                                Email : {assignedDoctor.email}
                            </p>
                            <button
                                className={styles.unassignButton}
                                onClick={handleUnassignDoctor}
                            >
                                <UserX size={16} /> Désaffecter le médecin
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className={styles.subtitle}>
                                Aucun médecin n'est affecté à ce patient. Recherchez et choisissez un médecin ci-dessous :
                            </p>

                            <div className={styles.searchWrapper}>
                                <input
                                    type="text"
                                    className={styles.searchInput}
                                    placeholder="Rechercher un médecin par nom ou spécialité..."
                                    value={searchDoctorTerm}
                                    onChange={(e) => setSearchDoctorTerm(e.target.value)}
                                />
                                <Search size={18} className={styles.searchIcon} />
                            </div>

                            <div className={styles.doctorsList}>
                                {filteredDoctors.length > 0 ? (
                                    filteredDoctors.map((doc) => (
                                        <div key={doc.user.id} className={styles.doctorItem}>
                                            <div>
                                                <strong className={styles.doctorName}>
                                                    Dr. {doc.user.firstName} {doc.user.lastName}
                                                </strong>
                                                <span className={styles.doctorSpecialty}>
                                                    Spécialité : {doc.doctor?.specialty?.specialtyName || 'Non renseignée'}
                                                </span>
                                            </div>
                                            <button
                                                className={styles.assignButton}
                                                onClick={() => handleAssignDoctor(doc.doctor?.id || doc.id)}
                                            >
                                                <UserCheck size={16} /> Affecter
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.emptyList}>
                                        Aucun médecin trouvé.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}