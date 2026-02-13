import axios from "axios";
import { useEffect, useState } from "react";

export default function Players() {

  const [players, setPlayers] = useState([]);
  const API = process.env.REACT_APP_API_URL;
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
            <h3>{p.name}</h3>
            <p>₹ {p.basePrice}</p>
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
    marginBottom: "20px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "#111",
    borderRadius: "12px",
    padding: "10px",
    textAlign: "center"
  },
  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "10px"
  },
  sold: {
    background: "red",
    padding: "5px",
    borderRadius: "6px",
    marginTop: "5px"
  }
};
