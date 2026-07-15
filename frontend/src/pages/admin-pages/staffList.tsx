import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffCard, { type StaffMember } from '../../components/StaffCard';
import styles from './staffList.module.css';
import SearchComponent from '../../components/searchComponent';
import { ArrowLeft, Plus } from 'lucide-react';
import StaffDetailsModal from '../../components/StaffDetailsModal';

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

  const [isSendingToken, setIsSendingToken] = useState(false);
  const [tokenSentSuccess, setTokenSentSuccess] = useState(false);

  // Gère le basculement entre le mode affichage (false) et le mode édition (true)
  const [isEditingAssignment, setIsEditingAssignment] = useState(false);

  // Stockent les choix temporaires de l'administrateur dans les listes déroulantes
  const [pendingSpecialtyId, setPendingSpecialtyId] = useState<number | string>('');
  const [pendingServiceId, setPendingServiceId] = useState<number | string>('');

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

  const handleResendActivationToken = async (userId: number, email: string) => {
    setIsSendingToken(true); // Active l'état de chargement
    setTokenSentSuccess(false);

    try {
      const res = await fetch(`${api_url}/staff/resendActivationToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId, email })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors du renvoi du jeton");
      }

      // Si ça fonctionne :
      setTokenSentSuccess(true);

      // Au bout de 3 secondes, on remet le bouton à son état normal
      setTimeout(() => {
        setTokenSentSuccess(false);
      }, 3000);

    } catch (err: any) {
      console.error("Erreur lors du renvoi du token d'activation :", err);
      alert(`Erreur : ${err.message}`);
    } finally {
      setIsSendingToken(false); // Désactive le chargement dans tous les cas
    }
  };

  const handleUpdateStaffStatus = async (userId: number, newStatus: string) => {
    console.log(`Tentative de mise à jour du statut pour l'utilisateur ID: ${userId}, Nouveau Statut: ${newStatus}`);

    try {
      const res = await fetch(`${api_url}/staff/updateStaffMemberStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId: userId, status: newStatus }) // Clé corrigée ici !
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Erreur HTTP ! Statut : ${res.status}, Message: ${errorData.message}`);
      }

      const data = await res.json();
      console.log("Statut du personnel mis à jour avec succès !", data);

      // 1. Recharger la liste générale en arrière-plan
      await fetchStaff();

      // 2. AJOUT ICI : Mettre à jour l'affichage de la modale ouverte en temps réel
      if (selectedMember && selectedMember.user.id === userId) {
        setSelectedMember((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            user: {
              ...prev.user,
              userStatus: newStatus // On injecte le nouveau statut ('ACTIVE' ou 'INACTIVE')
            }
          };
        });
      }

    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut du personnel:", err);
    }
  };

  const handleSaveAssignment = async () => {
    if (!selectedMember) return;

    // Prépare les données selon le rôle
    const payload = {
      userId: selectedMember.user.id,
      specialtyId: selectedMember.user.role === 'DOCTOR' ? (pendingSpecialtyId ? Number(pendingSpecialtyId) : null) : undefined,
      serviceId: selectedMember.user.role === 'NURSE_ASSISTANT' ? (pendingServiceId ? Number(pendingServiceId) : null) : undefined,
    };

    console.log("Données prêtes pour le backend :", payload);

    try {
      const res = await fetch(`${api_url}/staff/assignStaffMember`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Erreur HTTP ! Statut : ${res.status}, Message: ${errorData.message}`);
      }
      const data = await res.json();
      console.log("Affectation mise à jour avec succès !", data);
      // 1. Recharger la liste générale en arrière-plan
      await fetchStaff();
      // 2. Mettre à jour l'affichage de la modale ouverte en temps réel
      setSelectedMember((prev) => {
        if (!prev) return null;

        // 1. Si c'est un médecin, on met à jour uniquement la branche doctor
        if (prev.user.role === 'DOCTOR' && prev.doctor) {
          const foundSpec = specialties.find(spec => spec.id === Number(pendingSpecialtyId));
          return {
            ...prev,
            doctor: {
              ...prev.doctor, // Conserve le registrationId obligatoire intact
              specialty: foundSpec ? { id: foundSpec.id, specialtyName: foundSpec.name } : undefined
            }
          };
        }

        // 2. Si c'est un aide-soignant, on met à jour uniquement la branche nurseAssistant
        if (prev.user.role === 'NURSE_ASSISTANT' && prev.nurseAssistant) {
          const foundSrv = services.find(srv => srv.id === Number(pendingServiceId));
          return {
            ...prev,
            nurseAssistant: {
              ...prev.nurseAssistant,
              service: foundSrv ? { id: foundSrv.id, serviceName: foundSrv.name } : undefined
            }
          };
        }

        return prev;
      });
      setIsEditingAssignment(false); // On repasse en mode lecture après sauvegarde
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour de l'affectation :", err);
      alert(`Erreur : ${err.message}`);
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

  useEffect(() => {
    if (selectedMember) {
      setPendingSpecialtyId(selectedMember.doctor?.specialty?.id ?? '');
      setPendingServiceId(selectedMember.nurseAssistant?.service?.id ?? '');
    }
    setIsEditingAssignment(false); // On repasse en mode lecture à l'ouverture/changement
  }, [selectedMember]);

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

  if (loading) return <div className={styles['loading']}> Chargement du personnel...</div>;
  if (error) return <div className={styles['error-message']}> Impossible de charger les données : {error}</div>;

  return (
    <div className={styles['staff-page-container']}>
      <div className={styles['page-header']}>
        <h2>Gestion du Personnel Médical</h2>
        <span className={styles['count-badge']}>{filteredStaffList.length} personnes trouvées</span>
      </div>

      <div className={styles['action-buttons-container']}>
        <button type="button" className={styles['back-button']} onClick={() => navigate('/admin')}>
          <ArrowLeft size={18} aria-hidden="true" /> Retour
        </button>

        <button type="button" className={styles['add-staff-button']} onClick={() => navigate('/admin/addStaff')}>
          <Plus size={18} aria-hidden="true" style={{ marginRight: '6px' }} />
          Ajouter un membre du personnel
        </button>
      </div>

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
          <span>Statut du compte</span>
        </div>
        {filteredStaffList.map((member) => (
          <StaffCard
            key={member.user.id}
            member={member}
            onSelect={setSelectedMember}
          />
        ))}
      </div>

      {selectedMember && (
        <StaffDetailsModal
          member={selectedMember}
          specialties={specialties}
          services={services}
          pendingSpecialtyId={pendingSpecialtyId}
          setPendingSpecialtyId={setPendingSpecialtyId}
          pendingServiceId={pendingServiceId}
          setPendingServiceId={setPendingServiceId}
          isEditingAssignment={isEditingAssignment}
          setIsEditingAssignment={setIsEditingAssignment}
          isSendingToken={isSendingToken}
          tokenSentSuccess={tokenSentSuccess}
          onClose={() => setSelectedMember(null)}
          onResendActivationToken={handleResendActivationToken}
          onUpdateStaffStatus={handleUpdateStaffStatus}
          onSaveAssignment={handleSaveAssignment}
        />
      )}
    </div>
  );
}