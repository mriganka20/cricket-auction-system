import React from "react";
import "./SoldBanner.css";

export default function SoldBanner({ show, text }) {
  if (!show) return null;

  return (
    <div className="sold-banner">
      {text}
    </div>
  );
}
