import { useNavigate, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isSummary = location.pathname === "/summary";

  return (
    <div
      style={{
        ...styles.wrapper,
        overflowY: isSummary ? "auto" : "hidden"
      }}
    >
      {/* HEADER */}
      <div style={styles.header}>
        <div style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          🏏 Patuli Cricket League
        </div>

        <div style={styles.navLinks}>
          <span onClick={() => navigate("/")}>Auction</span>
          <span onClick={() => navigate("/players")}>All Players</span>
          <span onClick={() => navigate("/summary")}>Summary</span>
        </div>
      </div>

      <div style={styles.pageContent}>
        {children}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    height: "100vh",   // MUST BE height, not minHeight
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(135deg, #0a4f5c, #001a23)",
    color: "white",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },

  header: {
    height: "55px",
    flexShrink: 0,   // 🔥 IMPORTANT
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    fontSize: "24px",
    fontWeight: "bold",
    background: "rgba(0,0,0,0.9)",
    borderBottom: "2px solid #ffd700"
  },

  navLinks: {
    position: "absolute",
    right: "40px",
    display: "flex",
    gap: "25px",
    fontSize: "18px",
    fontWeight: "600",
    color: "#ffd700",
    cursor: "pointer"
  },

  pageContent: {
    flex: 1,
    overflowY: "auto",   // 🔥 THIS ENABLES SCROLL
    padding: "20px 60px"
  }
};

