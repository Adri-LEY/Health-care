import React from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../../components/InputField";
import styles from "./SignUp.module.css";
import SubmitButton from "../../components/SubmitButton";
import { ArrowLeft } from "lucide-react";


export default function SignUp() {
    const navigate = useNavigate();
    const [lastName, setLastName] = React.useState('');
    const [firstName, setFirstName] = React.useState('');

    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState('');

    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');

    const [gender, setGender] = React.useState('');
    const [birthDate, setBirthDate] = React.useState('');
    const [address, setAddress] = React.useState('');

    const [signUpSuccess, setSignUpSuccess] = React.useState(false);

    const [error, setError] = React.useState('');

    const apiUrl = import.meta.env.VITE_API_URL;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault(); // Empêche le rechargement de la page

        const payload = {
            lastName,
            firstName,
            email: email,
            phone,
            password,
            gender,
            birthDate,
            address
        };

        try {
            const response = await fetch(`${apiUrl}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la création du compte');
            }

            console.log('Compte créé avec succès ! Données reçues :', data);

            setSignUpSuccess(true);

            await new Promise(resolve => setTimeout(resolve, 3000));

            localStorage.setItem('token', data.accessToken);

            navigate('/dashboard');

        } catch (error) {
            console.error('Erreur lors de la création du compte :', error);
            setError(error instanceof Error ? error.message : 'Erreur inconnue lors de la création du compte');
        }
    }

    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <button type="button" onClick={() => navigate(-1)} className={styles.backButton}>
                    <ArrowLeft size={18} aria-hidden="true" />
                    <span>Retour</span>
                </button>

                {signUpSuccess && (
                    <div className={styles.success}>
                        <h1 className={styles.title}>HealthManager</h1>
                        <h2 className={styles.subtitle}>
                            Compte créé avec succès !
                        </h2>
                        <p className={styles.text}>
                            Vous allez être redirigé vers le tableau de bord dans quelques instants.
                        </p>
                    </div>
                )}

                {!signUpSuccess && (
                    <div>
                        <h1 className={styles.title}>
                            HealthManager
                        </h1>

                        <h2 className={styles.subtitle}>
                            Créer un compte
                        </h2>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.grid}>
                                <InputField
                                    label="Nom"
                                    type="text"
                                    value={lastName}
                                    required={true}
                                    onChange={setLastName}
                                />

                                <InputField
                                    label="Prénom"
                                    type="text"
                                    value={firstName}
                                    required={true}
                                    onChange={setFirstName}
                                />
                            </div>

                            <div className={styles.grid}>
                                <InputField
                                    label="Email"
                                    type="email"
                                    value={email}
                                    required={true}
                                    onChange={setEmail}
                                />

                                <InputField
                                    label="Téléphone"
                                    type="tel"
                                    value={phone}
                                    required={true}
                                    onChange={setPhone}
                                />
                            </div>

                            <div className={styles.grid}>
                                <InputField
                                    label="Mot de passe"
                                    subtext="Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial."
                                    type="password"
                                    value={password}
                                    required={true}
                                    onChange={setPassword}
                                />

                                <InputField
                                    label="Confirmer le mot de passe"
                                    type="password"
                                    value={confirmPassword}
                                    required={true}
                                    onChange={setConfirmPassword}
                                />
                            </div>

                            <div className={styles.grid}>


                                <div className={styles.genderContainer}>
                                    <p className={styles.genderLabel}>Genre</p>

                                    <div className={styles.grid}>
                                        <InputField
                                            label="M"
                                            type="radio"
                                            name="gender"
                                            value="M"
                                            checked={gender === "M"}
                                            required={true}
                                            onChange={setGender}
                                        />

                                        <InputField
                                            label="F"
                                            type="radio"
                                            name="gender"
                                            value="F"
                                            checked={gender === "F"}
                                            required={true}
                                            onChange={setGender}
                                        />
                                    </div>
                                </div>


                                <InputField
                                    label="Date de naissance"
                                    type="date"
                                    value={birthDate}
                                    required={true}
                                    onChange={setBirthDate}
                                />
                            </div>

                            <InputField
                                label="Adresse"
                                type="text"
                                value={address}
                                required={true}
                                onChange={setAddress}
                            />

                            {error && (
                                <div className={styles.error}>
                                    {error}
                                </div>
                            )}

                            <a href="/login" className={styles.loginLink}>
                                Déjà un compte ? Connectez-vous
                            </a>

                            <SubmitButton>Créer un compte</SubmitButton>
                        </form>
                    </div>
                )}
            </section>
        </main>
    );
}