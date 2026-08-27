import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import styles from "./RendezVousSection.module.css";
import { Calendar } from "lucide-react";

interface RendezVousSectionProps {
    data: {
        totalAppointments: number;
        upcoming: number;
        completed: number;
        cancelled: number;
        evolution?: { month: string; count: number }[];
    };
}

const RendezVousSection = ({ data }: RendezVousSectionProps) => {
    const evolutionData = data?.evolution || [
        { month: "Jan", count: 12 },
        { month: "Fév", count: 19 },
        { month: "Mar", count: 15 },
        { month: "Avr", count: 22 },
        { month: "Mai", count: 28 },
        { month: "Juin", count: 25 },
    ];

    return (
        <section className={styles["rdv-section"]}>
            {/* Header du bloc */}
            <div className={styles["rdv-header"]}>
                <div className={styles["rdv-title"]}>
                    <div className={styles["rdv-icon"]}>
                        <Calendar size={16} className={styles["rdv-svg"]} />
                    </div>
                    <div>
                        <h2>RENDEZ-VOUS</h2>
                        <p>Vue d'ensemble des rendez-vous</p>
                    </div>
                </div>
            </div>

            {/* Contenu du bloc */}
            <div className={styles["rdv-content"]}>
                {/* Métriques / KPIs */}
                <div className={styles["rdv-stats-grid"]}>
                    <div className={styles["rdv-stat-card"]}>
                        <span className={styles["rdv-stat-number"]}>
                            {data?.totalAppointments?.toLocaleString("fr-FR") || 0}
                        </span>
                        <span className={styles["rdv-stat-label"]}>Total</span>
                    </div>

                    <div className={styles["rdv-stat-card"]}>
                        <span className={`${styles["rdv-stat-number"]} ${styles["stat-upcoming"]}`}>
                            {data?.upcoming?.toLocaleString("fr-FR") || 0}
                        </span>
                        <span className={styles["rdv-stat-label"]}>À venir</span>
                    </div>

                    <div className={styles["rdv-stat-card"]}>
                        <span className={`${styles["rdv-stat-number"]} ${styles["stat-completed"]}`}>
                            {data?.completed?.toLocaleString("fr-FR") || 0}
                        </span>
                        <span className={styles["rdv-stat-label"]}>Réalisés</span>
                    </div>

                    <div className={styles["rdv-stat-card"]}>
                        <span className={`${styles["rdv-stat-number"]} ${styles["stat-cancelled"]}`}>
                            {data?.cancelled?.toLocaleString("fr-FR") || 0}
                        </span>
                        <span className={styles["rdv-stat-label"]}>Annulés</span>
                    </div>
                </div>

                {/* Séparateur */}
                <div className={styles["rdv-separator"]} />

                {/* Graphique de l'évolution */}
                <div className={styles["rdv-chart"]}>
                    <h3>Évolution des rendez-vous</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart
                            data={evolutionData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey="count"
                                name="Rendez-vous"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorCount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </section>
    );
};

export default RendezVousSection;