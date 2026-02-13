const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: String,
  purse: { type: Number, default: 50000 },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }]
});

module.exports = mongoose.model("Team", teamSchema);
