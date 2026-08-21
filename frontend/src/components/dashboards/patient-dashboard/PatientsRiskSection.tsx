import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertTriangle, Users, FileText } from 'lucide-react';
import styles from './PatientsRiskSection.module.css';
import { useNavigate } from 'react-router';

const COLORS = { high: '#ef4444', moderate: '#f59e0b', low: '#10b981', unassessed: '#94a3b8' };

interface PatientsRiskSectionProps {
  data: any;
  onViewMedicalRecord?: (medicalRecordId: number | string) => void;
}

const PatientsRiskSection: React.FC<PatientsRiskSectionProps> = ({ data, onViewMedicalRecord }) => {
  const chartData = [
    { name: 'Élevé', value: data.riskDistribution.high, color: COLORS.high },
    { name: 'Modéré', value: data.riskDistribution.moderate, color: COLORS.moderate },
    { name: 'Faible', value: data.riskDistribution.low, color: COLORS.low },
    { name: 'Non évalué', value: data.riskDistribution.unassessed, color: COLORS.unassessed },
  ].filter(item => item.value > 0);

  const navigate = useNavigate();
  
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>
          <Users size={20} color="#2563eb" />
          Patients & Risques (Total: {data.totalPatients})
        </h2>
      </div>

      <div className={styles.innerGrid}>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.alertBox}>
          <h3 className={styles.alertTitle}>
            <AlertTriangle size={16} />
            Alertes - Haut Risque ({data.highRiskList.length})
          </h3>
          <div className={styles.scrollableList}>
            {data.highRiskList.map((patient: any) => (
              <div key={patient.id} className={styles.alertItem}>
                <div className={styles.alertItemHeader}>
                  <div>
                    <p className={styles.patientName}>{patient.firstName} {patient.lastName}</p>
                    <p className={styles.patientDetail}>{patient.phone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.viewRecordBtn}
                  onClick={() => navigate(`/patient/medicalRecord/${patient.id}`, { state: { returnTo: '/doctor/dashboard' } })}
                >
                  <FileText size={13} />
                  Consulter dossier médical
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientsRiskSection;