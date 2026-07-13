import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './patientResearch.module.css';
import SearchComponent from '../../components/searchComponent';
import { ArrowLeft, Plus } from 'lucide-react';
import { useDebounce } from '../../components/useDebounce';
import PatientCard from '../../components/PatientCard';
// Importe ton composant de carte patient ou modale quand ils seront prêts :
// import PatientCard from '../../components/PatientCard'; 

// Définition de l'interface basée sur ton retour Back-end
export interface PatientData {
    id: number;
    lastName: string;
    firstName: string;
    email: string;
    phone: string;
    role: string;
    createdAt: string;
    userStatus: string;
    patient: {
        id: number;
        age: number;
        gender: 'F' | 'M' | string;
        birthDate: string;
        address: string;
        intern: boolean; // true = Interne, false = Externe
        userId: number;
        medicalRecordId: number;
        doctorId: number | null;
    };
}

export default function PatientResearch() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<PatientData[]>([]);
    const [loading, setLoading] = useState(false); // À passer à true lors de ton fetch
    const [searchTerm, setSearchTerm] = useState('');

    // States pour les filtres du SearchComponent
    const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]); // ["INTERN", "EXTERN"]

    const debouncedSearchTerm = useDebounce(searchTerm, 400);

    const apiUrl = import.meta.env.VITE_API_URL;
    const limit = 20;

    // Fonctions de Toggle pour les filtres
    const toggleGender = (gender: string) => {
        setSelectedGenders(prev => prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]);
    };

    const toggleType = (type: string) => {
        setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    };

    // Filtrage local ultra-rapide grâce à useMemo
    const filteredPatients = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return patients.filter((item) => {
            const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
            const email = item.email.toLowerCase();
            const phone = item.phone?.toLowerCase() ?? '';

            // 1. Recherche textuelle
            const matchesSearch = !normalizedSearch ||
                [fullName, email, phone].some(value => value.includes(normalizedSearch));

            // 2. Filtre par Genre (F / M)
            const matchesGender = selectedGenders.length === 0 ||
                selectedGenders.includes(item.patient.gender);

            // 3. Filtre par Type (Interne / Externe)
            const itemType = item.patient.intern ? 'INTERN' : 'EXTERN';
            const matchesType = selectedTypes.length === 0 ||
                selectedTypes.includes(itemType);

            return matchesSearch && matchesGender && matchesType;
        });
    }, [patients, searchTerm, selectedGenders, selectedTypes]);


    const fetchPatients = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/patients/searchPatients?q=${searchTerm}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des patients');
            }

            const data = await response.json();
            setPatients(data.data); // Assurez-vous que la structure de la réponse correspond à vos attentes
        } catch (error) {
            console.log('Erreur lors de la récupération des patients:', error);
        }
        setLoading(false);
    }

    useEffect(() => {
    
    const fetchPatients = async () => {
      try {
        console.log(`Lancement du fetch pour : ${debouncedSearchTerm}`);
        // Utilise limit=50 maximum pour valider ton @Max(50) du DTO
        const res = await fetch(`${apiUrl}/patients/searchPatients?q=${encodeURIComponent(debouncedSearchTerm)}&limit=50`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const json = await res.json();
        setPatients(json.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPatients();
  }, [debouncedSearchTerm]); // On écoute uniquement la valeur debouncée !


    if (loading) return <div className={styles['loading']}>Chargement des patients...</div>;

    return (
        <div className={styles['patient-research-container']}>
            <div className={styles['page-header']}>
                <h1 className={styles['patient-research-title']}>Recherche de patients</h1>
                <span className={styles['count-badge']}>
                    {filteredPatients.length} patient{filteredPatients.length > 1 ? 's' : ''} trouvé{filteredPatients.length > 1 ? 's' : ''}
                </span>
            </div>

            <p className={styles['patient-research-description']}>
                Recherchez et gérez les informations des patients.
            </p>

            <div className={styles['action-buttons-container']}>
                <button type="button" className={styles['back-button']} onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={18} aria-hidden="true" /> Retour
                </button>
            </div>

            <SearchComponent
                searchTerm={searchTerm}
                searchPlaceholder="Rechercher un patient par nom, prénom, email ou téléphone..."
                onSearchChange={setSearchTerm}
                groups={[
                    /*{
                        title: "Genre",
                        options: [
                            { id: "M", name: "Homme" },
                            { id: "F", name: "Femme" }
                        ],
                        selectedOptions: selectedGenders,
                        onToggle: toggleGender
                    },
                    {
                        title: "Prise en charge",
                        options: [
                            { id: "INTERN", name: "Patient Interne" },
                            { id: "EXTERN", name: "Patient Externe" }
                        ],
                        selectedOptions: selectedTypes,
                        onToggle: toggleType
                    }*/
                ]}
            />

            <div className={styles['patient-list']}>
                <div className={styles['patient-list-header']}>
                    <span>Nom / Prénom</span>
                    <span>Genre / Âge</span>
                    <span>Contact</span>
                    <span>Type</span>
                    <span>Statut du dossier</span>
                </div>

                {filteredPatients.length === 0 ? (
                    <div className={styles['empty-list']}>Aucun patient ne correspond à la recherche.</div>
                ) : (
                    filteredPatients.map((item) => (
                        // C'est ici que tu mapperás ton PatientCard comme pour StaffCard :
                        <PatientCard 
                            key={item.id}
                            patient={item}
                            onClick={() => navigate(`/patients/${item.id}`)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}