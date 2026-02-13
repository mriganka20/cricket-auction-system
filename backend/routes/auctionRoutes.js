const express = require("express");
const router = express.Router();
const Player = require("../models/Player");
const Team = require("../models/Team");
const path = require("path");
const PDFDocument = require("pdfkit");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* ================= MULTER CONFIG ================= */

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "cricket-auction",
    allowed_formats: ["jpg", "jpeg", "png"]
  }
});

const upload = multer({ storage });

/* ================= GET ALL DATA ================= */

router.get("/data", async (req, res) => {
  try {
    const players = await Player.find();
    const teams = await Team.find().populate("players");
    return res.json({ players, teams });
  } catch (err) {
    return res.status(500).json({ error: "Error fetching data" });
  }
});

/* ================= ADD PLAYER ================= */

router.post("/add-player", upload.single("image"), async (req, res) => {
  try {
    if (!req.body.name || !req.body.role)
      return res.status(400).json({ error: "Name and Role required" });

    const newPlayer = new Player({
      name: req.body.name,
      role: req.body.role,
      basePrice: 2000,
      image: req.file ? req.file.path : "",
      cloudinaryId: req.file ? req.file.filename : null,
      currentBid: 0,
      leadingTeam: null
    });

    await newPlayer.save();
    return res.json({ success: true });

  } catch (error) {
    return res.status(500).json({ error: "Error adding player" });
  }
});


/* ================= START AUCTION (RANDOM PLAYER) ================= */

router.post("/start", async (req, res) => {
  try {
    const players = await Player.aggregate([
      { $match: { status: "pending" } },
      { $sample: { size: 1 } }
    ]);

    if (players.length === 0) {
      return res.json(null);
    }

    return res.json(players[0]);

  } catch (err) {
    return res.status(500).json({ error: "Error starting auction" });
  }
});

/* ================= PLACE BID (PRO LOGIC) ================= */

router.post("/bid", async (req, res) => {
  try {
    const { playerId, teamId, bidAmount } = req.body;

    if (!playerId || !teamId)
      return res.status(400).json({ error: "Team selection required" });

    if (!bidAmount || bidAmount <= 0)
      return res.status(400).json({ error: "Invalid bid amount" });

    const player = await Player.findById(playerId);
    if (!player)
      return res.status(400).json({ error: "Invalid player" });

    if (player.status === "sold")
      return res.status(400).json({ error: "Player already sold" });

    const team = await Team.findById(teamId).populate("players");
    if (!team)
      return res.status(400).json({ error: "Invalid team" });

    /* ---- Squad Full Protection ---- */
    const MAX_PLAYERS = 8;
    const BASE_PRICE = 2000;

    const playersBought = team.players.length;
    const slotsLeft = MAX_PLAYERS - playersBought;

    if (slotsLeft <= 0)
      return res.status(400).json({ error: "Team squad full (8 players)" });

    /* ---- Max Bid Restriction Logic ---- */
    const minRequired = (slotsLeft - 1) * BASE_PRICE;
    const maxAllowedBid = team.purse - minRequired;

    if (Number(bidAmount) <= player.currentBid)
      return res.status(400).json({ error: "Bid must be higher than current bid" });

    if (Number(bidAmount) > maxAllowedBid)
      return res.status(400).json({
        error: `Maximum allowed bid is ₹${maxAllowedBid}`
      });

    /* ---- Refund Previous Leading Team ---- */
    if (player.leadingTeam) {
      const previousTeam = await Team.findOne({ name: player.leadingTeam });

      if (previousTeam) {
        previousTeam.purse += player.currentBid;
        await previousTeam.save();
      }
    }

    /* ---- Deduct From Current Team ---- */
    team.purse -= Number(bidAmount);

    player.currentBid = Number(bidAmount);
    player.leadingTeam = team.name;

    await player.save();
    await team.save();

    return res.json({
      currentBid: player.currentBid,
      leadingTeam: player.leadingTeam,
      purse: team.purse
    });

  } catch (err) {
    console.error("BID ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


/* ================= CLOSE AUCTION ================= */

router.post("/close", async (req, res) => {
  try {
    const { playerId } = req.body;

    if (!playerId)
      return res.status(400).json({ error: "Invalid request" });

    const player = await Player.findById(playerId);
    if (!player)
      return res.status(400).json({ error: "Player not found" });

    if (!player.leadingTeam)
      return res.status(400).json({ error: "No bids placed" });

    if (player.status === "sold")
      return res.status(400).json({ error: "Player already sold" });

    const team = await Team.findOne({ name: player.leadingTeam }).populate("players");

    if (!team)
      return res.status(400).json({ error: "Invalid team" });

    /* ---- Squad Limit Protection ---- */
    if (team.players.length >= 8)
      return res.status(400).json({ error: "Team already has 8 players" });

    /* ---- Finalize Sale ---- */
    player.status = "sold";
    player.soldTo = team.name;
    player.soldPrice = player.currentBid;

    team.players.push(player._id);

    await player.save();
    await team.save();

    return res.json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: "Error closing auction" });
  }
});


/* ================= RESET AUCTION ================= */

router.post("/reset", async (req, res) => {
  try {
    await Player.updateMany({}, {
      status: "pending",
      soldTo: null,
      soldPrice: null,
      currentBid: 0,
      leadingTeam: null
    });

    await Team.updateMany({}, {
      purse: 50000,
      players: []
    });

    return res.json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: "Error resetting auction" });
  }
});

const XLSX = require("xlsx");

/* ================= TEAM SUMMARY EXPORT ================= */

const ExcelJS = require("exceljs");

/* Export Summary to Excel */
router.get("/summary-export", async (req, res) => {
  try {
    const teams = await Team.find().populate("players");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Auction Summary");

    // Define ONLY the required columns
    sheet.columns = [
      { header: "Team Name", key: "team", width: 20 },
      { header: "Player Name", key: "name", width: 25 },
      { header: "Role", key: "role", width: 25 },
      { header: "Sold Price", key: "price", width: 15 }
    ];

    teams.forEach(team => {

      if (team.players.length === 0) {
        sheet.addRow({
          team: team.name,
          name: "No players purchased",
          role: "-",
          price: "-"
        });

      } else {

        team.players.forEach(player => {
          sheet.addRow({
            team: team.name,
            name: player.name,
            role: player.role,
            price: player.soldPrice
          });
        });

      }

      sheet.addRow({}); // spacing row
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=auction-summary.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("EXPORT ERROR:", err);
    res.status(500).json({ error: "Excel export failed" });
  }
});

router.get("/summary-pdf", async (req, res) => {
  try {
    const teams = await Team.find().populate("players");

    const doc = new PDFDocument({
      margin: 50,
      size: "A4"
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=auction-summary.pdf"
    );

    doc.pipe(res);

    /* ================= HEADER ================= */
    doc
      .fontSize(20)
      .text("Patuli Cricket League Auction Summary", {
        align: "center"
      });

    doc.moveDown(2);

    let startY = doc.y;

    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];

      // If not first team → add new page
      if (i !== 0) {
        doc.addPage();
        startY = 50;
      }

      /* ================= TEAM HEADER ================= */
      doc
        .fontSize(16)
        .text(`Team: ${team.name}`, 50, startY);

      doc
        .fontSize(12)
        .text(`Remaining Wallet: ₹ ${team.purse.toLocaleString()}`);

      doc.moveDown(1);

      /* ================= TABLE HEADER ================= */
      const tableTop = doc.y + 10;

      const col1 = 50;
      const col2 = 280;
      const col3 = 450;

      doc
        .fontSize(12)
        .text("Player Name", col1, tableTop);

      doc.text("Role", col2, tableTop);

      doc.text("Sold Price", col3, tableTop);

      doc.moveTo(col1, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      let rowY = tableTop + 25;
      let totalSpent = 0;

      if (team.players.length === 0) {
        doc.text("No players purchased", col1, rowY);
      } else {
        team.players.forEach(player => {
          totalSpent += player.soldPrice || 0;

          doc.text(player.name, col1, rowY);
          doc.text(player.role || "-", col2, rowY);
          doc.text(`₹ ${player.soldPrice}`, col3, rowY);

          rowY += 20;
        });
      }

      doc.moveDown(2);

      /* ================= TOTAL ================= */
      doc
        .fontSize(12)
        .text(`Total Spent: ₹ ${totalSpent.toLocaleString()}`, 50, rowY + 20);
    }

    doc.end();

  } catch (err) {
    console.error("PDF EXPORT ERROR:", err);
    res.status(500).json({ error: "PDF Export failed" });
  }
});

/* DELETE ALL PLAYERS */
router.delete("/delete-all-players", async (req, res) => {
  try {
    await Player.deleteMany({});
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Error deleting players" });
  }
});

/* DELETE PLAYER COMPLETELY */
router.delete("/delete-player/:id", async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);

    if (!player)
      return res.status(404).json({ error: "Player not found" });

    /* Refund Team if Sold */
    if (player.soldTo) {
      const team = await Team.findOne({ name: player.soldTo });

      if (team) {
        team.players = team.players.filter(
          p => p.toString() !== player._id.toString()
        );

        team.purse += player.soldPrice || 0;
        await team.save();
      }
    }

    /* Delete from Cloudinary */
    if (player.cloudinaryId) {
      await cloudinary.uploader.destroy(player.cloudinaryId);
    }

    /* Delete Player */
    await Player.findByIdAndDelete(req.params.id);

    return res.json({ success: true });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    return res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
