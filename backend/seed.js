require("dotenv").config();
const mongoose = require("mongoose");
const Team = require("./models/Team");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected for Seeding"))
  .catch(err => console.log(err));

async function seed() {
  try {
    // Only delete teams (optional)
    await Team.deleteMany();

    await Team.insertMany([
      { name: "Team A", purse: 50000, players: [] },
      { name: "Team B", purse: 50000, players: [] },
      { name: "Team C", purse: 50000, players: [] },
      { name: "Team D", purse: 50000, players: [] }
    ]);

    console.log("Teams Seeded Successfully");
    process.exit();
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
}

seed();
