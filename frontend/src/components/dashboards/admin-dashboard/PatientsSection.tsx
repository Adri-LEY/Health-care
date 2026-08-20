import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import styles from "./PatientsSection.module.css"; // Ou import styles from "./PatientsSection.module.css";
import { Users } from "lucide-react";

const PatientsSection = ({ data }: { data: any }) => {
  const ageData = [
    { name: "<18", count: data?.groupedByAge?.under18 || 0 },
    { name: "18-30", count: data?.groupedByAge?.from18to30 || 0 },
    { name: "31-45", count: data?.groupedByAge?.from31to45 || 0 },
    { name: "46-60", count: data?.groupedByAge?.from46to60 || 0 },
    { name: ">60", count: data?.groupedByAge?.over60 || 0 },
  ];

  const genderData = [
    { name: "Hommes", value: data?.groupedByGender?.male || 0 },
    { name: "Femmes", value: data?.groupedByGender?.female || 0 },
  ];

  const genderColors = ["#4F46E5", "#EC4899"];

  return (
    <section className={styles["patients-section"]}>
      {/* Header du bloc */}
      <div className={styles["patients-header"]}>
        <div className={styles["patients-title"]}>
          <div className={styles["patients-icon"]}>
            <Users size={16} className={styles["patients-svg"]} />
          </div>
          <div>
            <h2>PATIENTS</h2>
            <p>Vue d'ensemble des patients</p>
          </div>
        </div>
      </div>

      {/* Contenu du bloc */}
      <div className={styles["patients-content"]}>
        {/* Total */}
        <div className={styles["patients-total"]}>
          <span className={styles["patients-total-number"]}>
            {data?.totalPatients?.toLocaleString("fr-FR") || 0}
          </span>
          <span className={styles["patients-total-label"]}>patients</span>
        </div>

        {/* Séparateur */}
        <div className={styles["patients-separator"]} />

        {/* Graphique Âge */}
        <div className={styles["patients-chart"]}>
          <h3>Répartition par âge</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="Patients" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique Sexe */}
        <div className={styles["patients-chart"]}>
          <h3>Répartition par sexe</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={genderData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={65}
                innerRadius={35}
              >
                {genderData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={genderColors[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default PatientsSection;