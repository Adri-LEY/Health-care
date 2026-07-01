import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import InputField from '../../components/InputField';
import SubmitButton from '../../components/SubmitButton';
import styles from './Profile.module.css';
import { ArrowLeft } from 'lucide-react';

export default function Profile() {
    const navigate = useNavigate();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [formData, setFormData] = useState({
        lastName: '',
        firstName: '',
        email: '',
        phone: ''
    });

    const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

    // Récupération du profil au chargement
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await fetch(`${apiUrl}/users/profile`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Impossible de récupérer les informations du profil');
                }

                const data = await response.json();
                console.log('Données du profil récupérées :', data);

                setUser(data);

                setFormData({
                    lastName: data.lastName,
                    firstName: data.firstName,
                    email: data.email,
                    phone: data.phone
                });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [apiUrl]);

    // Fonction générique pour mettre à jour un champ du formulaire
    const handleFieldChange = (field: keyof typeof formData) => (value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Soumission des modifications du profil
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`${apiUrl}/users/update-profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error("Erreur lors de la mise à jour");

            const updatedData = await response.json();

            setUser(updatedData);
            setIsEditing(false);
        } catch (err: any) {
            alert(err.message);
        }
    };

    // Annulation des modifications du profil
    const handleCancel = () => {
        if (user) {
            setFormData({
                lastName: user.lastName,
                firstName: user.firstName,
                email: user.email,
                phone: user.phone
            });
        }
        setIsEditing(false);
    };

    // Soumission du changement de mot de passe
    const handlePasswordUpdate = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Veuillez remplir tous les champs de mot de passe.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/users/update-password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            });

            if (!response.ok) throw new Error("Erreur lors de la mise à jour du mot de passe");

            alert("Mot de passe mis à jour avec succès.");

            // Réinitialisation de la zone de saisie
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsChangingPassword(false);
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return <div className={styles.container}>Chargement de votre compte...</div>;
    if (error) return <div className={styles.container} style={{ color: 'red' }}>{error}</div>;
    if (!user) return <div className={styles.container}>Aucun utilisateur trouvé.</div>;

    return (




        <div className={styles.container}>

            <button type="button" onClick={() => navigate(-1)} className={styles.backButton}>
                <ArrowLeft size={18} aria-hidden="true" />
                <span>Retour</span>
            </button>

            <h1 className={styles.title}>Mon Compte</h1>
            <p className={styles.metaInfo}>Membre depuis le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>


            {/* FORMULAIRE 1 : Informations personnelles */}
            <form onSubmit={handleUpdateProfile} style={{ width: '100%' }}>
                <div className={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 className={styles.cardTitle} style={{ margin: 0, border: 'none' }}>Informations personnelles</h2>
                        {!isEditing && (
                            <button type="button" onClick={() => setIsEditing(true)} style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', backgroundColor: '#3182ce', color: 'white', border: 'none', fontWeight: 'bold' }}>
                                ✏️ Modifier mes informations
                            </button>
                        )}
                    </div>

                    <div className={styles.grid}>
                        <InputField label="Nom" type="text" value={formData.lastName} onChange={handleFieldChange('lastName')} disabled={!isEditing} />
                        <InputField label="Prénom" type="text" value={formData.firstName} onChange={handleFieldChange('firstName')} disabled={!isEditing} />
                    </div>
                    <div className={styles.grid}>
                        <InputField label="Adresse Email" type="email" value={formData.email} onChange={handleFieldChange('email')} disabled={!isEditing} />
                        <InputField label="Numéro de téléphone" type="tel" value={formData.phone} onChange={handleFieldChange('phone')} disabled={!isEditing} />
                    </div>

                    {user.role === 'PATIENT' && (
                        <div className={styles.grid}>
                            <InputField label="Adresse" type="text" value={user.userDetails?.address || 'Non spécifié'} onChange={() => { }} disabled={!isEditing} />
                        </div>
                    )}

                    {user.role === 'PATIENT' && (
                        <div className={styles.grid}>
                            <InputField label="Âge" type="text" value={user.userDetails?.age || 'Non spécifié'} onChange={() => { }} disabled={true} />
                            <InputField label="Genre" type="text" value={user.userDetails?.gender || 'Non spécifié'} onChange={() => { }} disabled={true} />
                        </div>
                    )}

                    {isEditing && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', maxWidth: '400px' }}>
                            <SubmitButton>Enregistrer</SubmitButton>
                            <button type="button" onClick={handleCancel} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: '#e2e8f0', cursor: 'pointer' }}>
                                Annuler
                            </button>
                        </div>
                    )}
                </div>
            </form>

            {/* ZONE DE SÉCURITÉ : Indépendante du premier formulaire */}
            <div className={styles.card}>
                <h2 className={styles.cardTitle}>Sécurité</h2>

                {!isChangingPassword ? (
                    <button
                        type="button"
                        onClick={() => setIsChangingPassword(true)}
                        style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', backgroundColor: '#4a5568', color: 'white', border: 'none', fontWeight: 'bold' }}
                    >
                        🔒 Modifier mon mot de passe
                    </button>
                ) : (
                    <div>
                        <div className={styles.grid}>
                            <InputField
                                label="Mot de passe actuel"
                                type="password"
                                value={currentPassword}
                                onChange={setCurrentPassword}
                            />
                            <InputField
                                label="Nouveau mot de passe"
                                type="password"
                                value={newPassword}
                                onChange={setNewPassword}
                            />
                        </div>

                        <div className={styles.grid}>
                            <InputField
                                label="Confirmer le nouveau mot de passe"
                                type="password"
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', maxWidth: '400px' }}>
                            {/* Appel direct à la fonction de mise à jour au clic */}
                            <button className={styles.submitButton} type="button" onClick={handlePasswordUpdate}>
                                Mettre à jour le mot de passe
                            </button>

                            <button
                                className={styles.cancelButton}
                                type="button"
                                onClick={() => {
                                    setIsChangingPassword(false);
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                }}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* DÉTAILS PROFESSIONNELS */}
            {['DOCTOR', 'NURSE', 'ADMINISTRATOR'].includes(user.role) && (
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Détails professionnels ({user.role})</h2>
                    <div className={styles.grid}>
                        <div className={styles.readOnlyField}>
                            <span className={styles.readOnlyLabel}>Numéro personnel</span>
                            <div className={styles.readOnlyValue}>{user.userDetails?.staffNumber || 'Non spécifié'}</div>
                        </div>
                        <div className={styles.readOnlyField}>
                            <span className={styles.readOnlyLabel}>Numéro d'Identification</span>
                            <div className={styles.readOnlyValue}>{user.userDetails?.doctor?.registrationId || 'Non spécifié'}</div>
                        </div>

                        {user.role === 'DOCTOR' && (
                            <div className={styles.readOnlyField}>
                                <span className={styles.readOnlyLabel}>Spécialité</span>
                                <div className={styles.readOnlyValue}>{user.specialty?.specialtyName || 'Non spécifié'}</div>
                            </div>
                        )}
                        {user.role === 'NURSE' && (
                            <div className={styles.readOnlyField}>
                                <span className={styles.readOnlyLabel}>Service Médical</span>
                                <div className={styles.readOnlyValue}>{user.service?.serviceName || 'Non spécifié'}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}