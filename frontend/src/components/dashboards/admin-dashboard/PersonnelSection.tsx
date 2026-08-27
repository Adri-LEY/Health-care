import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

import styles from "./PersonnelSection.module.css";
import { Stethoscope } from "lucide-react";

interface PersonnelSectionProps {
    data: {
        doctors: number;
        nurses: number;
        groupedBySpecialty?: { specialtyName: string; doctorCount: number }[];
        totalStaff?: number;
    };
}

const ROLE_COLORS = ["#0EA5E9", "#F59E0B"];

const PersonnelSection = ({ data }: PersonnelSectionProps) => {
    const totalStaff = data?.totalStaff || (data?.doctors || 0) + (data?.nurses || 0);

    const rolesData = [
        { name: "Médecins", value: data?.doctors || 0 },
        { name: "Aides-soignants", value: data?.nurses || 0 },
    ];

    const specialtiesData = data?.groupedBySpecialty || [
        { specialtyName: "Cardiologie", doctorCount: 8 },
        { specialtyName: "Méd. Générale", doctorCount: 12 },
        { specialtyName: "Pédiatrie", doctorCount: 5 },
        { specialtyName: "Urgences", doctorCount: 7 },
    ];

    return (
        <section className={styles["personnel-section"]}>
            {/* Header du bloc */}
            <div className={styles["personnel-header"]}>
                <div className={styles["personnel-title"]}>
                    <div className={styles["personnel-icon"]}>
                        <Stethoscope size={16} className={styles["personnel-svg"]} />
                    </div>
                    <div>
                        <h2>PERSONNEL</h2>
                        <p>Vue d'ensemble de l'équipe médicale</p>
                    </div>
                </div>
            </div>

            {/* Contenu du bloc */}
            <div className={styles["personnel-content"]}>
                {/* Total & Répartition Rapide */}
                <div className={styles["personnel-total"]}>
                    <span className={styles["personnel-total-number"]}>
                        {totalStaff.toLocaleString("fr-FR")}
                    </span>
                    <span className={styles["personnel-total-label"]}>soignants au total</span>

                    <div className={styles["personnel-subdetails"]}>
                        <div>
                            <strong>{data?.doctors || 0}</strong> médecins
                        </div>
                        <div>
                            <strong>{data?.nurses || 0}</strong> aides-soignants
                        </div>
                    </div>
                </div>

                {/* Séparateur */}
                <div className={styles["personnel-separator"]} />

                {/* Graphique Spécialités (Barres Horizontales) */}
                <div className={styles["personnel-chart"]}>
                    <h3>Répartition par spécialité</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart
                            layout="vertical"
                            data={specialtiesData}
                            margin={{ top: 0, right: 15, left: 10, bottom: 0 }}
                        >
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="specialtyName"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "#475569" }}
                                width={90}
                            />
                            <Tooltip/>
                            <Bar
                                dataKey="doctorCount"
                                fill="#0EA5E9"
                                radius={[0, 4, 4, 0]}
                                barSize={12}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Graphique Rôles (Donut) */}
                <div className={styles["personnel-chart"]}>
                    <h3>Répartition des rôles</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={rolesData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="42%"
                                outerRadius={55}
                                innerRadius={30}
                                paddingAngle={2}
                            >
                                {rolesData.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={ROLE_COLORS[index % ROLE_COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip/>
                            <Legend
                                verticalAlign="bottom"
                                height={30}
                                iconType="circle"
                                wrapperStyle={{ fontSize: "11px" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </section>
    );
};

export default PersonnelSection;