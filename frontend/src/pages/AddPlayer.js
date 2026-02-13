import { useState } from "react";
import axios from "axios";

export default function AddPlayer() {

  const [formData, setFormData] = useState({
    name: "",
    role: ""
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const API =
    process.env.REACT_APP_API_URL ||
    "http://localhost:5000/api";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("role", formData.role);
    if (image) data.append("image", image);

    await axios.post(`${API}/add-player`, data);

    alert("Player Added Successfully");

    setFormData({ name: "", role: "" });
    setImage(null);
    setPreview(null);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Add New Player</h2>

        <form onSubmit={handleSubmit} style={styles.form}>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Player Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Role</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              style={styles.fileInput}
            />
          </div>

          {preview && (
            <div style={styles.previewContainer}>
              <img src={preview} alt="preview" style={styles.previewImage} />
            </div>
          )}

          <button type="submit" style={styles.button}>
            Add Player
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {

  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    minHeight: "calc(100vh - 60px)"
  },

  card: {
    width: "100%",
    maxWidth: "480px",
    background: "rgba(0,0,0,0.9)",
    borderRadius: "18px",
    padding: "25px",
    border: "2px solid #ffd700",
    boxShadow: "0 0 20px rgba(255,215,0,0.2)"
  },

  title: {
    textAlign: "center",
    fontSize: "22px",
    marginBottom: "20px",
    color: "#ffd700",
    letterSpacing: "1px"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column"
  },

  label: {
    fontSize: "15px",
    marginBottom: "5px",
    opacity: 0.9
  },

  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #444",
    background: "#111",
    color: "white",
    fontSize: "16px",   // 🔥 Mobile readable
    width: "95%"
  },

  fileInput: {
    color: "white",
    fontSize: "14px"
  },

  previewContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "5px"
  },

  previewImage: {
    width: "100%",
    maxWidth: "220px",
    height: "250px",
    objectFit: "contain",
    background: "#000",
    borderRadius: "12px",
    border: "2px solid #ffd700"
  },

  button: {
    marginTop: "10px",
    padding: "14px",
    background: "linear-gradient(90deg, #ffd700, #ffcc00)",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
    color: "#000"
  }
};
