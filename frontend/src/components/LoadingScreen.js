// src/components/LoadingScreen.js
import React, { useEffect, useState } from "react";

function LoadingScreen({ isLoading }) {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowMessage(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowMessage(false);
    }
  }, [isLoading]);

  return (
    <div
      id="loading-overlay"
      className={`fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="loading-spinner w-12 h-12 border-4 border-gray-500 border-t-red-500 rounded-full animate-spin mb-4"></div>
      {showMessage && (
        <p className="text-gray-300 text-sm text-center px-4">
          Loading might take up to a minute as the backend service on Render.com
          spins up after inactivity on the free plan.
        </p>
      )}
    </div>
  );
}

export default LoadingScreen;
