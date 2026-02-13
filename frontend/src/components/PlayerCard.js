export default function PlayerCard({ player, currentBid, leadingTeam, showSold }) {

const imageUrl = player.image || 
  "https://via.placeholder.com/800x500?text=No+Image";

  return (
    <div style={styles.stage}>

      {/* IMAGE */}
      <div style={styles.imageContainer}>
        <img src={imageUrl} alt={player.name} style={styles.image} />
        <div style={styles.badge}>
          {player.status.toUpperCase()}
        </div>
      </div>

      {/* INFO */}
      <div style={styles.infoSection}>
        <h2 style={styles.name}>{player.name}</h2>
        <p style={styles.role}>{player.role}</p>
        <p style={styles.basePrice}>
          Base Price: ₹ {player.basePrice}
        </p>
      </div>

      {/* BID BANNER */}
      <div style={styles.bidBanner}>
        <div style={styles.bidAmount}>₹ {currentBid}</div>
        {leadingTeam !== "None" && (
          <div style={styles.leading}>
            Leading: {leadingTeam}
          </div>
        )}
      </div>
      {showSold && (
  <div style={styles.soldOverlay}>
    SOLD
  </div>
)}

    </div>
  );
}

const styles = {

stage: {
  position: "relative",  // 🔥 REQUIRED
  width: "100%",
  maxWidth: "650px",
  background: "#1a1a1a",
  borderRadius: "20px",
  padding: "17px",
  border: "3px solid #ffd700",
  margin: 0,
  boxShadow: "0 0 30px rgba(255,215,0,0.3)"
},
            
  imageContainer: {
    position: "relative",
    background: "#000",
    borderRadius: "15px",
    padding: "0",
    overflow: "hidden"
  },

image: {
  width: "100%",
  height: "305px",
  objectFit: "contain",   // 👈 shows full image
  background: "#000",     // keeps black background
  display: "block"
},

  badge: {
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "#ffc107",
    padding: "6px 15px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "12px",
    color: "#000",
    textTransform: "uppercase"
  },

  infoSection: {
    marginTop: "10px",
    textAlign: "center"
  },

name: {
  fontSize: "26px",
  fontWeight: "bold",
  margin: "6px 0 2px 0",
  color: "#fff",
  textTransform: "uppercase",
  letterSpacing: "1px"
},

role: {
  fontSize: "15px",
  opacity: 0.85,
  margin: "2px 0",
  color: "#ccc"
},

basePrice: {
  fontSize: "15px",
  margin: "2px 0 6px 0",
  color: "#fff"
},

bidBanner: {
  marginTop: "8px",
  background: "linear-gradient(135deg, #222, #000)",
  borderRadius: "14px",
  padding: "8px 12px",   // 🔥 reduced top & bottom padding
  textAlign: "center",
  border: "2px solid #ffd700",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: "3px"              // 🔥 reduces space between amount and leading text
},

bidAmount: {
  fontSize: "30px",
  fontWeight: "bold",
  color: "#ffd700",
  margin: 0,
  lineHeight: "34px",   // 🔥 removes extra vertical spacing
  textShadow: "0 0 8px rgba(255,215,0,0.4)"
},

leading: {
  fontSize: "16px",
  margin: 0,          // 🔥 removes extra top space
  color: "#ddd",
  opacity: 0.9
},

soldOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "70px",
  fontWeight: "bold",
  color: "#ffd700",
  letterSpacing: "5px",
  textShadow: "0 0 20px #ffd700",
  animation: "soldZoom 0.6s ease-out forwards"
}

};
