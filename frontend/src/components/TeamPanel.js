import React from "react";

export default function TeamPanel({ teams }) {
  return (
    <div>
      <h3>Teams</h3>
      {teams.map(team => (
        <div key={team._id} style={teamStyle}>
          <strong>{team.name}</strong>
          <p>Wallet: ₹ {team.purse}</p>
          <p>Players: {team.players.length}</p>
        </div>
      ))}
    </div>
  );
}

const teamStyle = {
  background: "#222",
  padding: "10px",
  borderRadius: "8px",
  marginBottom: "10px",
  color: "white"
};
