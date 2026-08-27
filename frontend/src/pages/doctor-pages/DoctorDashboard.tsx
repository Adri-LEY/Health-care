import React, { useEffect, useState } from 'react';
import PatientsRiskSection from '../../components/dashboards/patient-dashboard/PatientsRiskSection';
import TodayAppointmentsSection from '../../components/dashboards/patient-dashboard/TodayAppointmentsSection';
import ActivitySection from '../../components/dashboards/patient-dashboard/ActivitySection';
import styles from './DoctorDashboard.module.css';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const MOCK_DOCTOR_STATS = {
  success: true,
  stats: {
    patients: {
      totalPatients: 4,
      riskDistribution: { low: 0, moderate: 0, high: 1, unassessed: 3 },
      highRiskList: [
        {
          id: 4,
          firstName: "Patrick",
          lastName: "Paterson",
          email: "patrick.paterson@test.com",
          phone: "+33677777777",
          medicalRecordId: 4
        }
      ]
    },
    appointments: {
      todayCount: 5,
      statusDistribution: { scheduled: 0, confirmed: 5, cancelled: 0, missed: 0 },
      todaySchedule: [
        { id: 2, dateTime: "2026-08-21T09:00:00.000Z", status: "CONFIRMED", patientId: 10 },
        { id: 3, dateTime: "2026-08-21T10:30:00.000Z", status: "CONFIRMED", patientId: 1 },
        { id: 4, dateTime: "2026-08-21T14:00:00.000Z", status: "CONFIRMED", patientId: 5 }
      ]
    },
    activity: {
      monthlyConsultations: [
        { month: "2026-08-01T00:00:00.000Z", total_consultations: 4 }
      ],
      recentConsultations: [
        {
          id: 12,
          date: "2026-08-21T12:39:13.361Z",
          visitReason: "Suivi de fracture du scaphoïde",
          medicalRecord: { patient: { user: { firstName: "Lucas", lastName: "Dubois" } } },
          aiAnalysis: null
        },
        {
          id: 7,
          date: "2026-08-21T12:39:13.306Z",
          visitReason: "Bilan lipidique et douleurs thoraciques",
          medicalRecord: { patient: { user: { firstName: "Patrick", lastName: "Paterson" } } },
          aiAnalysis: { riskScore: 88.4, riskClass: "High" }
        }
      ]
    }
  }
};



const DoctorDashboard = () => {
  const [stats, setStats] = useState(MOCK_DOCTOR_STATS.stats);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/statistics/doctor-stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();

        console.log("Fetched doctor stats:", data);

        setStats(data.stats);
      } catch (error) {
        console.error("Error fetching doctor stats:", error);
      }
    };

    fetchStats();
  }, []);

  const navigate = useNavigate();

  return (
    <div className={styles.dashboardContainer}>
      <button type="button" className={styles['backButton']} onClick={() => navigate('/')}>
        <ArrowLeft size={18} aria-hidden="true" /> Retour
      </button>
      <h1 className={styles.dashboardTitle}>👨‍⚕️ Dashboard Médecin</h1>

      {stats && (
        <div className={styles.dashboardGrid}>
          <PatientsRiskSection data={stats.patients} />

          <div className={styles.dashboardBottomRow}>
            <TodayAppointmentsSection data={stats.appointments} />
            <ActivitySection data={stats.activity} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;