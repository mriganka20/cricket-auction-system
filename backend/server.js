const multer = require("multer");
const path = require("path");

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Image Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
app.use("/uploads", express.static("uploads"));

const auctionRoutes = require("./routes/auctionRoutes");
app.use("/api", auctionRoutes);

const PORT = process.env.PORT || 5000;
app.use("/uploads", express.static("uploads"));
app.listen(PORT, () => console.log("Server Running"));
