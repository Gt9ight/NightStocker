import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="button-selector-container">
      {/* RoadTech Button */}
      <button
        className="large-button roadtech-button"
        onClick={() => navigate("/tech")}
      >
        RoadTech 🛣️
      </button>

      {/* Stocker Button */}
      <button
        className="large-button stocker-button"
        onClick={() => navigate("/stocker")}
      >
        Stocker 📦
      </button>
    </div>
  );
};

export default Home;
