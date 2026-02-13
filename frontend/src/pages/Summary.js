import axios from "axios";
import { useEffect, useState } from "react";

export default function Summary() {

    const [teams, setTeams] = useState([]);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        const res = await axios.get("/api/data");
        setTeams(res.data.teams);
    };

    const exportExcel = () => {
        //window.open("http://localhost:5000/api/summary-export");
        window.open(`${process.env.REACT_APP_API_URL}/summary-export`);
    };

    const exportPDF = () => {
        //window.open("http://localhost:5000/api/summary-pdf");
        window.open(`${process.env.REACT_APP_API_URL}/summary-pdf`);
    };


    return (
        <div style={styles.wrapper}>
            <h2 style={styles.title}>Team Wise Auction Summary</h2>

            <div style={styles.buttonGroup}>
                <button style={styles.exportBtn} onClick={exportExcel}>
                    Export to Excel
                </button>

                <button style={styles.exportBtn} onClick={exportPDF}>
                    Export to PDF
                </button>
            </div>


            {teams.map(team => (
                <div key={team._id} style={styles.teamCard}>
                    <h3 style={styles.teamName}>
                        {team.name} — ₹{team.purse}
                    </h3>

                    {team.players.length === 0 ? (
                        <p style={{ opacity: 0.6 }}>No players purchased</p>
                    ) : (
                        <table style={styles.table}>
                            <colgroup>
                                <col style={{ width: "40%" }} />
                                <col style={{ width: "45%" }} />
                                <col style={{ width: "20%" }} />
                            </colgroup>

                            <thead>
                                <tr>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Role</th>
                                    <th style={styles.th}>Sold Price</th>
                                </tr>
                            </thead>

                            <tbody>
                                {team.players.map(player => (
                                    <tr key={player._id}>
                                        <td style={styles.td}>{player.name}</td>
                                        <td style={styles.td}>{player.role}</td>
                                        <td style={{ ...styles.td, color: "#ffd700", fontWeight: "600" }}>
                                            ₹{player.soldPrice}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ))}
        </div>
    );
}

const styles = {

    wrapper: {
        flex: 1,
        padding: "10px 80px 30px 80px",  // reduced top padding
        color: "white"
    },

    title: {
        fontSize: "28px",
        marginBottom: "25px"
    },

    exportBtn: {
        background: "#28a745",
        padding: "10px 20px",
        border: "none",
        borderRadius: "8px",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer",
        marginBottom: "30px"
    },

    teamCard: {
        background: "#0c0c0c",
        padding: "12px 30px",
        borderRadius: "16px",
        marginBottom: "30px",
        border: "1px solid rgba(255,215,0,0.3)"
    },

    teamName: {
        fontSize: "20px",
        marginBottom: "15px",
        color: "#ffd700"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse"
    },

    table: {
        width: "80%",
        borderCollapse: "collapse",
        marginTop: "15px"
    },

    th: {
        textAlign: "left",
        padding: "10px 0",
        fontWeight: "600",
        opacity: 0.9
    },

    td: {
        padding: "8px 0",
        opacity: 0.95
    },

    buttonGroup: {
        display: "flex",
        gap: "15px",    // spacing between buttons
        marginBottom: "10px"
    },
};

