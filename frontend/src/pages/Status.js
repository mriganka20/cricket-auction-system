import React, { useEffect, useState } from "react";
import axios from "axios";
import PlayerCard from "../components/PlayerCard";
import { Link } from "react-router-dom";

export default function Status() {

  const [players,setPlayers] = useState([]);
  const API = process.env.REACT_APP_API_URL;

  useEffect(()=>{
    fetchData();
  },[]);

  const fetchData = async () => {
    const res = await axios.get(`${API}/data`);
    setPlayers(res.data.players);
  };

  const sold = players.filter(p=>p.status==="sold");
  const unsold = players.filter(p=>p.status==="unsold");

  return (
    <div style={{ padding:"20px", color:"white" }}>
      <Link to="/">⬅ Back</Link>

      <h2>Sold Players</h2>
      <div style={gridStyle}>
        {sold.map(player => (
          <PlayerCard key={player._id} player={player} />
        ))}
      </div>

      <h2>Unsold Players</h2>
      <div style={gridStyle}>
        {unsold.map(player => (
          <PlayerCard key={player._id} player={player} />
        ))}
      </div>
    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))",
  gap: "15px"
};
