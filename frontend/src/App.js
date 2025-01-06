import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import About from "./pages/About";
import News from "./pages/News";
import Schedule from "./pages/Schedule";
import { motion } from "framer-motion";

function App() {
  const linkVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.08 },
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
        {/* HEADER / NAVBAR */}
        <header className="bg-gray-800 p-4 flex items-center justify-between">
          <Link to="/">
            <h1 className="text-3xl font-bold uppercase tracking-wider">
              Valorant Collegiate Next-Gen
            </h1>
          </Link>
          <nav className="space-x-4 text-sm">
            <motion.div
              className="inline-block"
              variants={linkVariants}
              whileHover="hover"
              initial="rest"
            >
              <Link to="/about" className="hover:text-red-400">
                About
              </Link>
            </motion.div>
            <motion.div
              className="inline-block"
              variants={linkVariants}
              whileHover="hover"
              initial="rest"
            >
              <Link to="/news" className="hover:text-red-400">
                News
              </Link>
            </motion.div>
            <motion.div
              className="inline-block"
              variants={linkVariants}
              whileHover="hover"
              initial="rest"
            >
              <Link to="/schedule" className="hover:text-red-400">
                Schedule
              </Link>
            </motion.div>
          </nav>
        </header>

        {/* ROUTES */}
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/about" element={<About />} />
            <Route path="/news" element={<News />} />
            <Route path="/schedule" element={<Schedule />} />
          </Routes>
        </div>

        {/* FOOTER */}
        <footer className="bg-gray-800 p-4 text-center text-sm text-gray-400">
          <div className="space-x-4">
            <motion.div
              className="inline-block"
              variants={linkVariants}
              whileHover="hover"
              initial="rest"
            >
              <Link to="/terms" className="hover:text-red-400">
                Terms
              </Link>
            </motion.div>
            <motion.div
              className="inline-block"
              variants={linkVariants}
              whileHover="hover"
              initial="rest"
            >
              <Link to="/privacy" className="hover:text-red-400">
                Privacy
              </Link>
            </motion.div>
          </div>
          <p className="mt-2">© 2025 Tinsley Devers — All rights reserved.</p>
          <p className="text-gray-500 text-xs mt-1">
            This site is a placeholder demo, not affiliated with or endorsed by
            Riot Games.
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
