// src/components/LoadingScreen.js
import React from "react";

function LoadingScreen({ isLoading }) {
  return (
    <div id="loading-overlay" className={`${isLoading ? "" : "hide"}`}>
      <div className="loading-spinner"></div>
    </div>
  );
}

export default LoadingScreen;
