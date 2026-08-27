import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Brain } from 'lucide-react';
import styles from './ActivitySection.module.css';

const ActivitySection = ({ data }: { data: any }) => {
  const chartData = data.monthlyConsultations.map((item: any) => ({
    month: new Date(item.month).toLocaleDateString('fr-FR', { month: 'short' }),
    total: item.total_consultations
  }));

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>
          <Activity size={20} color="#0d9488" />
          Activité & Consultations récentes
        </h2>
      </div>

      <div className={styles.innerGrid}>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.scrollableList}>
          {data.recentConsultations.map((consultation: any) => {
            const user = consultation.medicalRecord?.patient?.user;
            return (
              <div key={consultation.id} className={styles.consultationItem}>
                <div className={styles.consultationHeader}>
                  <span>{user?.firstName} {user?.lastName}</span>
                  {consultation.aiAnalysis && (
                    <span className={styles.riskBadge}>
                      <Brain size={12} />
                      {consultation.aiAnalysis.riskScore}%
                    </span>
                  )}
                </div>
                <p className={styles.reasonText}>{consultation.visitReason}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActivitySection;