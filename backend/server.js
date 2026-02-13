require("dotenv").config();
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Image Storage Config
/*const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
app.use("/uploads", express.static("uploads"));*/

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "cricket-auction",
    allowed_formats: ["jpg", "jpeg", "png"],
  }
});

const upload = multer({ storage });

const auctionRoutes = require("./routes/auctionRoutes");
app.use("/api", auctionRoutes);

const PORT = process.env.PORT || 5000;
app.use("/uploads", express.static("uploads"));
app.listen(PORT, () => console.log("Server Running"));
