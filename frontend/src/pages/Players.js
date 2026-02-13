import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Players() {

  const [players, setPlayers] = useState([]);
  const API = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const res = await axios.get(`${API}/data`);
    setPlayers(res.data.players);
  };

  return (
    <div>
      <h2 style={styles.title}>All Players</h2>
      <div style={styles.topBar}>
        <button
          style={styles.addBtn}
          onClick={() => navigate("/add-player")}>
          Add Player
        </button>
      </div>
      <div style={styles.grid}>
        {players.map(p => (
          <div key={p._id} style={styles.card}>
            <img
              //src={`http://localhost:5000${p.image}`}
              //src={`${process.env.REACT_APP_API_URL.replace("/api", "")}${p.image}`}
              src={p.image || "https://via.placeholder.com/300x300?text=No+Image"}
              alt={p.name}
              style={styles.image}
            />
            <h3 style={styles.playerName}>{p.name}</h3>
            <p style={styles.price}>₹ {p.basePrice}</p>
            {p.status === "sold" && (
              <div style={styles.sold}>SOLD</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  title: {
    marginBottom: "20px",
    marginTop: "5px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "#111",
    borderRadius: "12px",
    padding: "8px",
    textAlign: "center"
  },
  image: {
    width: "100%",
    height: "250px",
    objectFit: "contain",
    borderRadius: "10px",
    display: "block"
  },
  sold: {
    background: "red",
    padding: "5px",
    borderRadius: "6px",
    marginTop: "5px"
  },
  playerName: {
    fontSize: "20px",
    fontWeight: "600",
    margin: "12px 0 4px 0",   // 🔥 reduce bottom gap
    color: "#fff",
    letterSpacing: "0.5px"
  },
  price: {
    fontSize: "16px",
    color: "#ffd700",
    fontWeight: "600",
    margin: "0"              // 🔥 remove default paragraph margin
  },
  topBar: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-50px",
    marginBottom: "10px"
  },
  addBtn: {
    background: "#28a745",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "15px",
    transition: "all 0.2s ease"
  }
};
