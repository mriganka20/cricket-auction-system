import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={styles.wrapper}>

      {/* HEADER */}
      <div style={styles.header}>

        {/* HAMBURGER ICON */}
        <div
          style={styles.hamburger}
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </div>

        <div
          style={styles.title}
          onClick={() => navigate("/")}
        >
          🏏 Patuli Cricket League Auction
        </div>

        {/* DESKTOP NAV */}
        <div style={styles.desktopNav} className="desktopNav">
          <span onClick={() => navigate("/")} style={styles.navLink}>
            Auction
          </span>
          <span onClick={() => navigate("/players")} style={styles.navLink}>
            All Players
          </span>
          <span onClick={() => navigate("/summary")} style={styles.navLink}>
            Summary
          </span>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <div onClick={() => { navigate("/"); setMenuOpen(false); }} style={styles.mobileItem}>
            Auction
          </div>
          <div onClick={() => { navigate("/players"); setMenuOpen(false); }} style={styles.mobileItem}>
            All Players
          </div>
          <div onClick={() => { navigate("/summary"); setMenuOpen(false); }} style={styles.mobileItem}>
            Summary
          </div>
        </div>
      )}

      {/* PAGE CONTENT */}
      <div style={styles.pageContent}>
        {children}
      </div>
    </div>
  );
}

const styles = {

  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a4f5c, #001a23)",
    display: "flex",
    flexDirection: "column",
    color: "white",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },

  header: {
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",   // center container
    background: "#000",
    borderBottom: "2px solid #ffd700",
    position: "relative"
  },

  title: {
    position: "absolute",   // 👈 makes it truly center
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "22px",
    fontWeight: "bold",
    cursor: "pointer",
    textAlign: "center"
  },

  hamburger: {
    position: "absolute",
    left: "20px",
    fontSize: "24px",
    cursor: "pointer"
  },

  desktopNav: {
    position: "absolute",
    right: "20px",
    display: "none",
    gap: "25px",
    fontSize: "18px",
  },

  navLink: {
    color: "#ffd700",
    cursor: "pointer",
    fontWeight: "600"
  },

  mobileMenu: {
    position: "absolute",
    top: "60px",
    left: 0,
    width: "200px",
    background: "#111",
    borderRight: "2px solid #ffd700",
    padding: "15px 0",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    zIndex: 999
  },

  mobileItem: {
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: "600",
    color: "#ffd700"
  },

  pageContent: {
    flex: 1,
    padding: "6px 35px 0px 35px"
  }
};
