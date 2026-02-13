import axios from "axios";
import { useEffect, useState } from "react";
import PlayerCard from "../components/PlayerCard";
import pclLogo from "../assets/pcl-logo.png";

export default function Auction() {

  const [player, setPlayer] = useState(null);
  const [teams, setTeams] = useState([]);
  const [bid, setBid] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [currentBid, setCurrentBid] = useState(0);
  const [leadingTeam, setLeadingTeam] = useState("None");
  const [showSold, setShowSold] = useState(false);

  const API = process.env.REACT_APP_API_URL;
  console.log("API URL:", process.env.REACT_APP_API_URL);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get(`${API}/data`);
    setTeams(res.data.teams);
  };

  const startAuction = async () => {
    const res = await axios.post(`${API}/start`);

    if (!res.data) {
      alert("No pending players");
      return;
    }

    setPlayer(res.data);
    setCurrentBid(res.data.basePrice);
    setBid(res.data.basePrice);
    setLeadingTeam("None");
  };

  const placeBid = async () => {
    try {
      if (!bid) {
        alert("Enter bid amount");
        return;
      }
      const res = await axios.post(`${API}/bid`, {
        playerId: player._id,
        teamId: selectedTeam,
        bidAmount: Number(bid)
      });

      console.log("Bid response:", res.data);   // debug

      setCurrentBid(res.data.currentBid);
      setLeadingTeam(res.data.leadingTeam);

      fetchData();   // refresh wallet values

    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("SERVER ERROR:", err.response?.data);
      alert(err.response?.data?.error || "Bid failed");
    }
  };

  const closeAuction = async () => {
    if (!player || !selectedTeam) {
      alert("No team has placed a bid yet!");
      return;
    }

    setShowSold(true);

    await axios.post(`${API}/close`, {
      playerId: player._id,
      teamId: selectedTeam,
      bidAmount: currentBid
    });

    // Wait for SOLD animation
    setTimeout(async () => {

      const res = await axios.post(`${API}/start`);

      if (!res.data) {
        setPlayer(null); // no more players
      } else {
        setPlayer(res.data);
        setCurrentBid(res.data.basePrice);
        setBid(res.data.basePrice);
        setLeadingTeam("None");
      }

      setSelectedTeam("");
      setShowSold(false);

    }, 10000);
  };

  if (!player) {
    return (
      <div style={styles.startScreen}>

        {/* LOGO */}
        <div style={styles.logoWrapper}>
          <img src={pclLogo} alt="PCL Logo" style={styles.logo} />
          <div style={styles.lightSweep}></div>
        </div>

        {/* TITLE */}
        <h1 style={styles.startTitle}>
          Welcome to Patuli Cricket League Auction
        </h1>

        {/* BUTTON */}
        <button style={styles.startBtn} onClick={startAuction}>
          START AUCTION
        </button>

      </div>

    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.leftPanel}>
        <PlayerCard
          player={player}
          currentBid={currentBid}
          leadingTeam={leadingTeam}
          showSold={showSold}
        />
      </div>

      <div style={styles.rightPanel}>
        <h2 style={styles.title}>Place Bid</h2>

        <select
          value={selectedTeam}
          onChange={e => setSelectedTeam(e.target.value)}
          style={styles.input}
        >
          <option value="">Select Team</option>
          {teams.map(t => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={bid}
          onChange={e => setBid(e.target.value)}
          style={styles.input}
        />

        <div style={styles.btnRow}>
          <button style={styles.bidBtn} onClick={placeBid}>Place Bid</button>
          <button style={styles.closeBtn} onClick={closeAuction}>Close</button>
        </div>

        <h3 style={{ ...styles.title, marginTop: "25px" }}>Team Wallet</h3>

        {teams.map(t => (
          <div key={t._id} style={styles.teamBox}>
            <span style={styles.teamName}>{t.name}</span>
            <span style={styles.teamPurse}>
              ₹{t.purse.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexWrap: "wrap",        // 🔥 allows stacking
    gap: "20px",
    justifyContent: "center"
  },
  leftPanel: {
    flex: "1 1 500px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start" // prevents vertical stretch
  },
  rightPanel: {
    width: "420px",
    background: "#000",
    border: "2px solid #ffd700",
    borderRadius: "20px",
    padding: "5px 15px 10px 15px", // 🔥 reduced top padding
    display: "flex",
    flex: "1 1 200px",
    flexDirection: "column"
  },
  title: {
    color: "#ffd700",
    marginBottom: "15px"
  },
  input: {
    width: "100%",
    padding: "12px 15px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: "1px solid #444",
    background: "#222",
    color: "#fff",
    fontSize: "15px",
    boxSizing: "border-box"   // ✅ ADD THIS
  },
  btnRow: {
    display: "flex",
    gap: "10px"
  },
bidBtn: {
  flex: 1,
  background: "#28a745",
  border: "none",
  padding: "8px 12px",   // slightly taller
  color: "white",
  borderRadius: "8px",
  fontSize: "15px",       // 🔥 increased
  fontWeight: "700",      // 🔥 bold
  letterSpacing: "0.5px",
  cursor: "pointer"
},
  closeBtn: {
  flex: 1,
  background: "linear-gradient(135deg, #dc3545, #b02a37)",
  border: "none",
  padding: "8px 12px",
  color: "white",
  borderRadius: "10px",
  fontSize: "15px",
  fontWeight: "700",
  letterSpacing: "0.5px",
  cursor: "pointer",
  boxShadow: "0 6px 15px rgba(0,0,0,0.3)",
  transition: "all 0.2s ease"
},
  teamBox: {
    display: "flex",
    justifyContent: "space-between",
    background: "#333",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px"
  },
  teamName: {
    fontSize: "16px"
  },
  teamPurse: {
    color: "#ffd700",
    fontWeight: "600"
  },
  startScreen: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    paddingTop: "18px"
  },
  startBtn: {
    background: "#ffd700",
    padding: "15px 30px",
    borderRadius: "10px",
    fontSize: "18px",
    border: "none"
  },
  logoWrapper: {
    position: "relative",
    width: "260px",
    height: "260px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "45px",   // 🔥 spacing between logo & text
    animation: "broadcastPulse 3s infinite ease-in-out"
  },
  logo: {
    width: "240px",
    height: "240px",
    borderRadius: "50%",
    objectFit: "contain",
    zIndex: 2
  },
  lightSweep: {
    position: "absolute",
    width: "120%",
    height: "120%",
    borderRadius: "50%",
    background:
      "linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)",
    animation: "lightMove 3s infinite",
    zIndex: 1
  },
  startTitle: {
    fontSize: "32px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    marginBottom: "35px",
    background: "linear-gradient(90deg, #ffd700, #ffffff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 0 15px rgba(255,215,0,0.6)"
  },
  startBtn: {
    background: "linear-gradient(135deg, #ffd700, #ffaa00)",
    color: "#000",
    padding: "16px 45px",
    border: "none",
    borderRadius: "50px",
    fontSize: "18px",
    fontWeight: "800",
    letterSpacing: "2px",
    cursor: "pointer",
    boxShadow: "0 0 25px rgba(255,215,0,0.6)",
    transition: "0.3s"
  }
};
