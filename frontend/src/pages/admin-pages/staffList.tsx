import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffCard, { type StaffMember } from '../../components/StaffCard';
import styles from './staffList.module.css';
import SearchComponent from '../../components/searchComponent';
import { ArrowLeft } from 'lucide-react';

export default function StaffPage() {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api_url = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const [searchTerm, setSearchTerm] = useState('');

  // Les catalogues d'options (objets complets provenant du Back)
  const [specialties, setSpecialties] = useState<{ id: number; name: string }[]>([]);
  const [services, setServices] = useState<{ id: number; name: string }[]>([]);

  // Les states de sélection
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);

  // Les fonctions de Toggle (reçoivent directement l'ID ou le Rôle cliqué)
  const toggleRole = (role: string) => {
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const toggleSpecialty = (id: number) => {
    setSelectedSpecialties(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const toggleService = (id: number) => {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // Requête HTTP pour récupérer le personnel une seule fois
  const fetchStaff = async () => {
    try {
      const res = await fetch(`${api_url}/staff/getAllStaff`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }

      );
      if (!res.ok) throw new Error(`Erreur HTTP ! Statut : ${res.status}`);

      const data = await res.json();
      setStaffList(data);
    } catch (err) {
      console.error("Erreur Fetch Staff:", err);
      if (err instanceof Error) setError(err.message);
    }
  };

  // Chargement initial du catalogue de spécialités
  const fetchAllSpecialties = async () => {
    try {
      const res = await fetch(`${api_url}/specialty/getAllSpecialties`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (!res.ok) throw new Error(`Erreur HTTP ! Statut : ${res.status}`);
      const data = await res.json();
      // On mappe pour harmoniser la clé en 'name'
      setSpecialties(data.map((spec: any) => ({ id: spec.id, name: spec.specialtyName })));
    } catch (err) {
      console.error("Erreur Fetch Specialties:", err);
    }
  };

  // Chargement initial du catalogue de services
  const fetchAllServices = async () => {
    try {
      const res = await fetch(`${api_url}/service/getAllServices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error(`Erreur HTTP ! Statut : ${res.status}`);
      const data = await res.json();
      setServices(data.map((service: any) => ({ id: service.id, name: service.serviceName })));
    } catch (err) {
      console.error("Erreur Fetch Services:", err);
    }
  };

  // Chargement initial des données, une seule fois
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchStaff(),
        fetchAllSpecialties(),
        fetchAllServices()
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  const filteredStaffList = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return staffList.filter((member) => {
      const fullName = `${member.user.firstName} ${member.user.lastName}`.toLowerCase();
      const email = member.user.email.toLowerCase();
      const phone = member.user.phone?.toLowerCase() ?? '';

      const matchesSearch = !normalizedSearch || [fullName, email, phone].some(value => value.includes(normalizedSearch));
      const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(member.user.role);
      const matchesSpecialty = selectedSpecialties.length === 0 || selectedSpecialties.includes(member.doctor?.specialty?.id ?? -1);
      const matchesService = selectedServices.length === 0 || selectedServices.includes(member.nurseAssistant?.service?.id ?? -1);

      return matchesSearch && matchesRole && matchesSpecialty && matchesService;
    });
  }, [staffList, searchTerm, selectedRoles, selectedSpecialties, selectedServices]);

  if (loading) return <div className={styles['loading']}>⏳ Chargement du personnel...</div>;
  if (error) return <div className={styles['error-message']}>⚠️ Impossible de charger les données : {error}</div>;

  return (
    <div className={styles['staff-page-container']}>
      <div className={styles['page-header']}>
        <h2>Gestion du Personnel Médical</h2>
        <span className={styles['count-badge']}>{filteredStaffList.length} personnes trouvées</span>
      </div>

      <button type="button" className={styles['back-button']} onClick={() => navigate(-1)}>
        <ArrowLeft size={18} aria-hidden="true"/> Retour
      </button>

      
      <SearchComponent
        searchTerm={searchTerm}
        searchPlaceholder="Rechercher par nom..."
        onSearchChange={setSearchTerm}
        groups={[
          {
            title: "Rôles",
            options: [
              { id: "DOCTOR", name: "Médecin" },
              { id: "NURSE_ASSISTANT", name: "Aide-soignant" }
            ],
            selectedOptions: selectedRoles, // Contiendra ex: ["DOCTOR"]
            onToggle: toggleRole
          },
          {
            title: "Spécialités",
            options: specialties,
            selectedOptions: selectedSpecialties,
            onToggle: toggleSpecialty
          },
          {
            title: "Services",
            options: services,
            selectedOptions: selectedServices,
            onToggle: toggleService
          }
        ]}
      />

      <div className={styles['staff-list']}>
        <div className={styles['staff-list-header']}>
          <span>Nom</span>
          <span>Rôle</span>
          <span>Contact</span>
          <span>Spécialité / Service</span>
        </div>
        {filteredStaffList.map((member) => (
          <StaffCard
            key={member.user.id}
            member={member}
            onSelect={setSelectedMember}
          />
        ))}
      </div>

      {/* Boîte Modale */}
      {selectedMember && (
        <div className={styles['modal-overlay']} onClick={() => setSelectedMember(null)}>
          <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
            <h3>Fiche Profil Détaillée</h3>
            <hr />
            <div className={styles['modal-body']}>
              <p><strong>Nom :</strong> {selectedMember.user.lastName}</p>
              <p><strong>Prénom :</strong> {selectedMember.user.firstName}</p>
              <p><strong>Email :</strong> {selectedMember.user.email}</p>
              <p><strong>Téléphone :</strong> {selectedMember.user.phone || 'Non renseigné'}</p>
              <p><strong>Matricule Interne :</strong> {selectedMember.doctor?.registrationId || selectedMember.nurseAssistant?.registrationId || 'Aucun'}</p>
            </div>
            <button className={styles['btn-close']} onClick={() => setSelectedMember(null)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}