import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StaffCard, { type StaffMember } from '../../components/StaffCard';
import SearchComponent from '../../components/searchComponent';
import styles from './doctorResearch.module.css';

export default function DoctorResearch() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const navigate = useNavigate();
    const [doctorsList, setDoctorsList] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const api_url = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const [searchTerm, setSearchTerm] = useState('');
    const [specialties, setSpecialties] = useState<{ id: number; name: string }[]>([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>([]);

    const toggleSpecialty = (id: number) => {
        setSelectedSpecialties(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Requête HTTP pour récupérer la liste des médecins
    const fetchDoctors = async () => {
        try {
            // Endpoint back à adapter si nécessaire
            const res = await fetch(`${api_url}/staff/getAllDoctors`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!res.ok) throw new Error(`Erreur HTTP ! Statut : ${res.status}`);

            const data = await res.json();

            console.log("Médecins récupérés :", data);

            // Filtre de sécurité frontend au cas où le back retournerait tout le staff
            const onlyDoctors = data.filter((member: StaffMember) => member.user.role === 'DOCTOR');
            setDoctorsList(onlyDoctors);
        } catch (err) {
            console.error("Erreur Fetch Doctors:", err);
            if (err instanceof Error) setError(err.message);
        }
    };

    // Chargement du catalogue des spécialités
    const fetchAllSpecialties = async () => {
        try {
            const res = await fetch(`${api_url}/specialty/getAllSpecialties`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!res.ok) throw new Error(`Erreur HTTP ! Statut : ${res.status}`);

            const data = await res.json();
            setSpecialties(data.map((spec: any) => ({ id: spec.id, name: spec.specialtyName })));
        } catch (err) {
            console.error("Erreur Fetch Specialties:", err);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([
                fetchDoctors(),
                fetchAllSpecialties()
            ]);
            setLoading(false);
        };

        loadData();
    }, []);

    // Filtrage par nom/prénom/email/téléphone et par spécialités sélectionnées
    const filteredDoctorsList = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return doctorsList.filter((doctor) => {
            const fullName = `${doctor.user.firstName} ${doctor.user.lastName}`.toLowerCase();
            const email = doctor.user.email.toLowerCase();
            const phone = doctor.user.phone?.toLowerCase() ?? '';

            const matchesSearch =
                !normalizedSearch ||
                [fullName, email, phone].some(value => value.includes(normalizedSearch));

            const matchesSpecialty =
                selectedSpecialties.length === 0 ||
                selectedSpecialties.includes(doctor.doctor?.specialty?.id ?? -1);

            return matchesSearch && matchesSpecialty;
        });
    }, [doctorsList, searchTerm, selectedSpecialties]);

    if (loading) return <div className={styles['loading']}>Chargement des médecins...</div>;
    if (error) return <div className={styles['error-message']}>Impossible de charger les données : {error}</div>;

    return (
        <div className={styles['doctor-page-container']}>
            <div className={styles['page-header']}>
                <h2>Recherche de Médecins</h2>
                <span className={styles['count-badge']}>
                    {filteredDoctorsList.length} médecin(s) trouvé(s)
                </span>
            </div>

            <div className={styles['action-buttons-container']}>
                <button type="button" className={styles['back-button']} onClick={() => navigate('/')}>
                    <ArrowLeft size={18} aria-hidden="true" /> Retour
                </button>
            </div>

            <SearchComponent
                searchTerm={searchTerm}
                searchPlaceholder="Rechercher un médecin par nom, email, téléphone..."
                onSearchChange={setSearchTerm}
                groups={[
                    {
                        title: "Spécialités",
                        options: specialties,
                        selectedOptions: selectedSpecialties,
                        onToggle: toggleSpecialty
                    }
                ]}
            />

            <div className={styles['doctors-list']}>
                <div className={styles['doctors-list-header']}>
                    <span>Nom</span>
                    <span>Rôle</span>
                    <span>Contact</span>
                    <span>Spécialité</span>
                </div>

                {filteredDoctorsList.length === 0 ? (
                    <div className={styles['no-results']}>Aucun médecin ne correspond à votre recherche.</div>
                ) : (
                    filteredDoctorsList.map((doctor) => (
                        <StaffCard
                            key={doctor.user.id}
                            member={doctor}
                            onSelect={() => 
                            {
                                if (user.role === 'PATIENT') {
                                    navigate(`/doctor/${doctor.doctor?.id}/profile`);
                                } else if (user.role === 'NURSE_ASSISTANT') {
                                    navigate(`/doctor/${doctor.doctor?.id}/planning`);
                                }
                            }}
                        />
                    ))
                )}
            </div>
        </div>
    );
}