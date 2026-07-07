import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../../components/InputField";
import styles from "./addStaff.module.css";
import SubmitButton from "../../components/SubmitButton";

export default function AddStaff() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'DOCTOR',
        specialtyId: null as number | null,
        serviceId: null as number | null,
        staffNumber: '',
        registrationId: ''
    });

    const [specialties, setSpecialties] = useState<{ id: number, name: string }[]>([]);
    const [services, setServices] = useState<{ id: number, name: string }[]>([]);
    const [showRecap, setShowRecap] = useState(false);

    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const api_url = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // 1. On intercepte la soumission du formulaire pour UNIQUEMENT afficher la modale
    const showRecapHandler = (event: React.FormEvent) => {
        event.preventDefault(); // Bloque le rafraîchissement de la page !
        setShowRecap(true);
    };

    // 2. La confirmation finale qui envoie les données à l'API
    const handleSubmit = async () => {
        try {
            const response = await fetch(`${api_url}/staff/createNewStaffMember`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de l\'ajout du membre du personnel');
            }

            console.log('Membre du personnel ajouté avec succès !');
            setShowRecap(false); // Ferme la modale par sécurité avant de naviguer
            setShowSuccessMessage(true);

            setTimeout(() => {
                navigate('/admin/staffList');
            }, 3000); // Redirection après 2 secondes
        } catch (err: any) {
            console.error("Erreur lors de l'ajout du membre du personnel :", err);
            alert(err.message);
        }
    };

    useEffect(() => {
        const fetchSpecialties = async () => {
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

        const fetchServices = async () => {
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
                setServices(data.map((srv: any) => ({ id: srv.id, name: srv.serviceName })));
            } catch (err) {
                console.error("Erreur Fetch Services:", err);
            }
        };

        fetchSpecialties();
        fetchServices();
    }, []);

    return (
        <div className={styles.addStaff}>
            <h1 className={styles.title}>Ajouter un membre du personnel</h1>

            {/* Le submit du formulaire déclenche l'ouverture de la modale en toute sécurité */}
            <form className={styles.form} onSubmit={showRecapHandler}>
                <div className={styles.grid}>
                    <InputField
                        label="Prénom"
                        type="text"
                        value={formData.firstName}
                        onChange={(value) => setFormData({ ...formData, firstName: value })}
                    />
                    <InputField
                        label="Nom"
                        type="text"
                        value={formData.lastName}
                        onChange={(value) => setFormData({ ...formData, lastName: value })}
                    />
                </div>

                <div className={styles.grid}>
                    <InputField
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(value) => setFormData({ ...formData, email: value })}
                    />
                    <InputField
                        label="Numéro de téléphone"
                        type="text"
                        value={formData.phone}
                        onChange={(value) => setFormData({ ...formData, phone: value })}
                    />
                </div>

                <div className={styles.grid}>
                    <InputField
                        label="Numéro de personnel"
                        type="text"
                        value={formData.staffNumber}
                        onChange={(value) => setFormData({ ...formData, staffNumber: value })}
                    />
                    <InputField
                        label="Numéro d'inscription"
                        type="text"
                        value={formData.registrationId}
                        onChange={(value) => setFormData({ ...formData, registrationId: value })}
                    />
                </div>

                <label className={styles.label}>Rôle</label>
                <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                    <option value="DOCTOR">Médecin</option>
                    <option value="NURSE_ASSISTANT">Aide-soignant</option>
                </select>

                {formData.role === 'DOCTOR' && (
                    <>
                        <label className={styles.label}>Spécialité</label>
                        <select
                            value={formData.specialtyId || ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                specialtyId: e.target.value ? Number(e.target.value) : null,
                                serviceId: null
                            })}
                        >
                            <option value="">Sélectionnez une spécialité</option>
                            {specialties.map((spec) => (
                                <option key={spec.id} value={spec.id}>
                                    {spec.name}
                                </option>
                            ))}
                        </select>
                    </>
                )}

                {formData.role === 'NURSE_ASSISTANT' && (
                    <>
                        <label className={styles.label}>Service</label>
                        <select
                            value={formData.serviceId || ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                serviceId: e.target.value ? Number(e.target.value) : null,
                                specialtyId: null
                            })}
                        >
                            <option value="">Sélectionnez un service</option>
                            {services.map((srv) => (
                                <option key={srv.id} value={srv.id}>
                                    {srv.name}
                                </option>
                            ))}
                        </select>
                    </>
                )}

                <SubmitButton>Ajouter le membre du personnel</SubmitButton>
            </form>

            {/* MODALE DE RÉCAPITULATIF */}
            {showRecap && (
                <div className={styles.modalOverlay}>
                    <div className={styles.recap}>
                        <h2>Récapitulatif des informations</h2>

                        <p><strong>Rôle :</strong> {formData.role === 'DOCTOR' ? 'Médecin' : 'Aide-soignant'}</p>
                        {formData.role === 'DOCTOR' && (
                            <p><strong>Spécialité :</strong> {specialties.find(spec => spec.id === formData.specialtyId)?.name || 'Non spécifiée'}</p>
                        )}
                        {formData.role === 'NURSE_ASSISTANT' && (
                            <p><strong>Service :</strong> {services.find(srv => srv.id === formData.serviceId)?.name || 'Non spécifié'}</p>
                        )}
                        <p><strong>Prénom :</strong> {formData.firstName}</p>
                        <p><strong>Nom :</strong> {formData.lastName}</p>
                        <p><strong>Email :</strong> {formData.email}</p>
                        <p><strong>Numéro de téléphone :</strong> {formData.phone}</p>
                        <p><strong>Numéro de personnel :</strong> {formData.staffNumber}</p>
                        <p><strong>Numéro d'inscription :</strong> {formData.registrationId}</p>

                        <div style={{ marginTop: '20px' }}>
                            <button className={styles.confirmButton} onClick={handleSubmit}>
                                Confirmer et Ajouter
                            </button>
                            {/* Bouton pour fermer la modale si l'utilisateur s'est trompé */}
                            <button type="button" className={styles.cancelButton} onClick={() => setShowRecap(false)}>
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessMessage && (
                <div className={styles.modalOverlay}>
                    <div className={styles.successMessage}>
                        <div className={styles.successIcon}>✓</div>
                        <h2>Membre ajouté avec succès !</h2>
                        <p>Le nouveau membre du personnel a bien été enregistré.</p>
                        <p className={styles.redirectText}>Redirection vers la liste en cours...</p>
                    </div>
                </div>
            )}
        </div>
    );
}