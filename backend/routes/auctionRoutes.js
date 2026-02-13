const express = require("express");
const router = express.Router();
const Player = require("../models/Player");
const Team = require("../models/Team");
const multer = require("multer");
const path = require("path");
const PDFDocument = require("pdfkit");

/* ================= MULTER CONFIG ================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
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
    const newPlayer = new Player({
      name: req.body.name,
      department: req.body.department,
      year: req.body.year,
      role: req.body.role,
      battingStyle: req.body.battingStyle,
      bowlingStyle: req.body.bowlingStyle,
      basePrice: 2000,
      currentBid: 0,
      leadingTeam: null,
      image: req.file ? `/uploads/${req.file.filename}` : ""
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

    const player = await Player.findById(playerId);
    if (!player)
      return res.status(400).json({ error: "Invalid player" });

    const team = await Team.findById(teamId);
    if (!team)
      return res.status(400).json({ error: "Invalid team" });

    if (Number(bidAmount) <= player.currentBid)
      return res.status(400).json({ error: "Bid too low" });

    if (team.purse < Number(bidAmount))
      return res.status(400).json({ error: "Insufficient balance" });

    /* ---- Refund Previous Leading Team ---- */
    if (player.leadingTeam) {
      const previousTeam = await Team.findOne({ name: player.leadingTeam });
      if (previousTeam) {
        previousTeam.purse += player.currentBid;
        await previousTeam.save();
      }
    }

    /* ---- Deduct New Bid ---- */
    team.purse -= Number(bidAmount);

    player.currentBid = Number(bidAmount);
    player.leadingTeam = team.name;

    await player.save();
    await team.save();

    return res.json({
      currentBid: player.currentBid,
      leadingTeam: player.leadingTeam
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

    const player = await Player.findById(playerId);
    if (!player || !player.leadingTeam)
      return res.status(400).json({ error: "No bids placed" });

    player.status = "sold";
    player.soldTo = player.leadingTeam;
    player.soldPrice = player.currentBid;

    const team = await Team.findOne({ name: player.leadingTeam });
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

module.exports = router;
