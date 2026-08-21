import { useEffect, useState } from "react";
import PatientsSection from "../../components/dashboards/admin-dashboard/PatientsSection";
import RendezVousSection from "../../components/dashboards/admin-dashboard/RendezVousSection";
import PersonnelSection from "../../components/dashboards/admin-dashboard/PersonnelSection";
import styles from "./dashboard.module.css";

const AdminDashboard = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/statistics/admin-stats`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();

                console.log("Fetched admin stats:", data);

                setStats(data.stats);
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            }
        };

        fetchStats();
    }, []);

  return (
    <div className={styles["admin-dashboard"]}>
      <h1 className={styles["dashboard-title"]}>📊 Dashboard administrateur</h1>
      
      {stats && (
        <div className={styles["dashboard-grid"]}>
          {/* Ligne 1 : Patients (Pleine largeur) */}
          <PatientsSection data={stats.patients} />

          {/* Ligne 2 : Rendez-vous & Personnel (Côte à côte) */}
          <div className={styles["dashboard-bottom-row"]}>
            <RendezVousSection data={stats.appointments} />
            <PersonnelSection data={stats.staff} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;