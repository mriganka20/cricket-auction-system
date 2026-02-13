const mongoose = require("mongoose");


const playerSchema = new mongoose.Schema({
  name: String,
  department: String,
  year: String,
  role: String,
  basePrice: { type: Number, default: 2000 },
  battingStyle: String,
  bowlingStyle: String,
  image: String,
  cloudinaryId: String,
  status: { type: String, default: "pending" },
  soldTo: String,
  soldPrice: Number,
  currentBid: { type: Number, default: 0 },
  leadingTeam: { type: String, default: null
}
});

module.exports = mongoose.model("Player", playerSchema);
