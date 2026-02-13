import { useState } from "react";
import axios from "axios";

export default function AddPlayer() {

  const [form,setForm] = useState({});
  const [image,setImage] = useState(null);

  //const API = "http://localhost:5000/api";
  const API = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(form).forEach(key=>{
      data.append(key,form[key]);
    });
    data.append("image",image);

    await axios.post(`${API}/add-player`, data);

    alert("Player Added!");
  };

  return (
    <div>
      <h2>Add Player</h2>

      <form onSubmit={handleSubmit}>
        <input placeholder="Name"
          onChange={e=>setForm({...form,name:e.target.value})} />

        <input placeholder="Role"
          onChange={e=>setForm({...form,role:e.target.value})} />

        <input type="file"
          onChange={e=>setImage(e.target.files[0])} />

        <button type="submit">Add Player</button>
      </form>
    </div>
  );
}
