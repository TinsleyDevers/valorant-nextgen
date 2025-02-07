// src/pages/Home.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "../components/LoadingScreen";

function StatBox({ label, value, color = "teal" }) {
  const colorClass =
    {
      teal: "text-teal-300",
      purple: "text-purple-300",
      yellow: "text-yellow-300",
      pink: "text-pink-300",
      blue: "text-blue-300",
      red: "text-red-300",
      green: "text-green-300",
    }[color] || "text-teal-300";

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-4 bg-gray-800 rounded shadow-lg hover:bg-gray-700 transition relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-transparent via-white/10 to-transparent blur-xl opacity-0 hover:opacity-10 transition"></div>
      <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold ${colorClass} mt-1`}>{value}</p>
    </motion.div>
  );
}

export default function Home() {
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [expandedMatchIds, setExpandedMatchIds] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedPlayerStats, setSelectedPlayerStats] = useState(null);
  const [selectedRankedStats, setSelectedRankedStats] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showRankedStats, setShowRankedStats] = useState(false);

  // New state for profile search
  const [searchInput, setSearchInput] = useState("");
  const [searchedProfile, setSearchedProfile] = useState("");
  const [profileNotLoggedIn, setProfileNotLoggedIn] = useState(false);

  // Use API_URL from the environment; default to render.com if not set.
  const API_URL =
    process.env.REACT_APP_API_URL || "https://valorant-nextgen.onrender.com";
  const modalRef = useRef(null);

  // Minimaps for heatmap background.
  const minimaps = {
    Ascent:
      "https://static.wikia.nocookie.net/valorant/images/0/04/Ascent_minimap.png",
    Bind: "https://static.wikia.nocookie.net/valorant/images/e/e6/Bind_minimap.png",
    Haven:
      "https://static.wikia.nocookie.net/valorant/images/2/25/Haven_minimap.png",
    Icebox:
      "https://static.wikia.nocookie.net/valorant/images/c/cf/Icebox_minimap.png",
  };

  // Fetch matches and leaderboard on mount.
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [resM, resLB] = await Promise.all([
          axios.get(`${API_URL}/api/matches`),
          axios.get(`${API_URL}/api/leaderboard`),
        ]);
        setMatches(resM.data.data);
        setLeaderboard(resLB.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    })();

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        closeModal();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [API_URL]);

  // Animation variants.
  const leagueButtonVariant = {
    rest: { scale: 1, opacity: 0.8 },
    hover: { scale: 1.05, opacity: 1, transition: { duration: 0.2 } },
  };

  const matchCardVariant = {
    rest: { scale: 1, opacity: 1 },
    hover: {
      scale: 1.03,
      opacity: 1,
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.8)",
      transition: { duration: 0.3 },
    },
  };

  const matchesContainerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const matchItemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 },
  };

  // Handler functions.
  const handleLeagueToggle = (league) => {
    setSelectedLeague(selectedLeague === league ? null : league);
    setExpandedMatchIds([]);
  };

  const toggleMatchExpand = (matchId) => {
    setExpandedMatchIds((prev) =>
      prev.includes(matchId)
        ? prev.filter((id) => id !== matchId)
        : [...prev, matchId]
    );
  };

  const closeModal = () => {
    setSelectedPlayer(null);
    setSelectedPlayerStats(null);
    setSelectedRankedStats(null);
    setShowHeatmap(false);
    setShowRankedStats(false);
  };

  const filteredMatches = selectedLeague
    ? matches.filter(
        (m) => m.tournament.toLowerCase() === selectedLeague.toLowerCase()
      )
    : matches;

  const getPlayerRank = (n, t) => {
    const lb = leaderboard.find(
      (p) =>
        p.name.toLowerCase() === n.toLowerCase() &&
        p.tagline.toLowerCase() === t.toLowerCase()
    );
    return lb ? lb.rank : null;
  };

  const isRadiantOrImmortal = (rankStr) =>
    rankStr &&
    (rankStr.toLowerCase().includes("immortal") ||
      rankStr.toLowerCase().includes("radiant"));

  const handlePlayerClick = async (matchId, player) => {
    closeModal();
    setSelectedPlayer(player);
    try {
      const res = await axios.get(
        `${API_URL}/api/match/${matchId}/player-stats`,
        {
          params: { name: player.name, tagline: player.tagline },
        }
      );
      setSelectedPlayerStats(res.data.advancedStats);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRankedStats = async (n, t) => {
    if (!showRankedStats) {
      try {
        const r = await axios.get(`${API_URL}/api/ranked-stats`, {
          params: { name: n, tagline: t },
        });
        setSelectedRankedStats(r.data.rankedStats);
      } catch {}
      setShowRankedStats(true);
    } else {
      setShowRankedStats(false);
      setSelectedRankedStats(null);
    }
  };

  // Profile search handler.
  const handleProfileSearch = (e) => {
    e.preventDefault();
    // Expect Riot ID format "username#tagline" (LATER CHANGE TO BE MORE RESPONSIVE / INTEARCTIVE / VISUAL ie. red border if invalid)
    if (!searchInput.includes("#")) {
      alert("Please enter a valid Riot ID (e.g., player#NA1).");
      return;
    }
    setSearchedProfile(searchInput);
    const [username, tagline] = searchInput.split("#");
    // Check if the profile exists in our tracked leaderboard.
    const found = leaderboard.find(
      (p) =>
        p.name.toLowerCase() === username.toLowerCase() &&
        p.tagline.toLowerCase() === tagline.toLowerCase()
    );
    if (!found) {
      setProfileNotLoggedIn(true);
    } else {
      // If found, for this demo we'll redirect to RSO login.
      window.location.href = "/auth/riot";
    }
  };

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      {!isLoading && (
        <div className="container mx-auto py-12 px-4">
          {/* League Matches Section */}
          <h1 className="text-4xl font-extrabold text-gray-100 text-center mb-8">
            Valorant Collegiate Next-Gen
          </h1>
          <div className="flex justify-center space-x-4 mb-12">
            <motion.button
              variants={leagueButtonVariant}
              initial="rest"
              whileHover="hover"
              className={`px-6 py-3 rounded-lg text-lg font-semibold transition shadow-md ${
                selectedLeague === "NJAACE"
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => handleLeagueToggle("NJAACE")}
            >
              NJAACE
            </motion.button>
            <motion.button
              variants={leagueButtonVariant}
              initial="rest"
              whileHover="hover"
              className={`px-6 py-3 rounded-lg text-lg font-semibold transition shadow-md ${
                selectedLeague === "Southern Esports Conference"
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => handleLeagueToggle("Southern Esports Conference")}
            >
              Southern Esports Conference
            </motion.button>
          </div>
          {filteredMatches.length === 0 ? (
            <p className="text-center text-gray-400">
              {selectedLeague
                ? "No matches found for this league."
                : "No matches found."}
            </p>
          ) : (
            <motion.div
              variants={matchesContainerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredMatches.map((match) => {
                const t0 = match.teams[0].roundsWon;
                const t1 = match.teams[1].roundsWon;
                const leftWinner = t0 > t1;
                const rightWinner = t1 > t0;
                const isExpanded = expandedMatchIds.includes(match.matchId);
                return (
                  <motion.div key={match.matchId} variants={matchItemVariants}>
                    <motion.div
                      variants={matchCardVariant}
                      initial="rest"
                      whileHover="hover"
                      className="relative rounded-lg overflow-hidden shadow-lg cursor-pointer bg-gray-900"
                      onClick={() => toggleMatchExpand(match.matchId)}
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-sm"
                        style={{ backgroundImage: `url(${match.mapImage})` }}
                      ></div>
                      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
                      <div className="relative p-6">
                        <h3 className="text-xl font-bold text-gray-100 mb-2">
                          {match.teams[0].name} vs {match.teams[1].name}
                        </h3>
                        <p className="text-sm text-gray-300 mb-4">
                          {match.map} | {match.date}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <img
                              src={match.teams[0].teamLogo}
                              alt="Team 0 Logo"
                              className="w-8 h-8 object-contain"
                            />
                            <span
                              className={`text-lg font-semibold px-3 py-1 rounded ${
                                leftWinner ? "bg-green-600" : "bg-red-600"
                              } text-white`}
                            >
                              {t0}
                            </span>
                          </div>
                          <p className="text-gray-300 font-bold">VS</p>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-lg font-semibold px-3 py-1 rounded ${
                                rightWinner ? "bg-green-600" : "bg-red-600"
                              } text-white`}
                            >
                              {t1}
                            </span>
                            <img
                              src={match.teams[1].teamLogo}
                              alt="Team 1 Logo"
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMatchExpand(match.matchId);
                          }}
                          className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
                        >
                          {isExpanded ? "Hide Details" : "View Details"}
                        </button>
                      </div>
                    </motion.div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4 }}
                          className="mt-2 bg-gray-800 rounded-lg overflow-hidden shadow-inner"
                        >
                          <div className="p-4 flex flex-col md:flex-row gap-4 bg-gray-900">
                            {match.teams.map((team, teamIdx) => (
                              <div
                                key={teamIdx}
                                className="bg-gray-800 p-4 rounded shadow-md flex-1"
                              >
                                <h4 className="font-semibold text-lg mb-3 text-gray-200 border-b border-gray-700 pb-2">
                                  {team.name}
                                </h4>
                                <div className="space-y-3">
                                  {team.players.map((player, i) => {
                                    const rank = getPlayerRank(
                                      player.name,
                                      player.tagline
                                    );
                                    const special = isRadiantOrImmortal(rank);
                                    let containerClass =
                                      "bg-gray-700 p-3 rounded hover:bg-gray-600 transition cursor-pointer relative";
                                    let highlightStyle = "";
                                    if (special) {
                                      if (
                                        rank?.toLowerCase().includes("radiant")
                                      ) {
                                        highlightStyle =
                                          "border-l-4 border-yellow-300 pl-3";
                                      } else if (
                                        rank?.toLowerCase().includes("immortal")
                                      ) {
                                        highlightStyle =
                                          "border-l-4 border-pink-300 pl-3";
                                      }
                                    }
                                    return (
                                      <motion.div
                                        key={i}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handlePlayerClick(
                                            match.matchId,
                                            player
                                          );
                                        }}
                                        className={`${containerClass} ${highlightStyle}`}
                                        whileHover={{ scale: 1.01 }}
                                      >
                                        <p className="text-sm text-white font-bold">
                                          {player.name}#{player.tagline}{" "}
                                          {rank && (
                                            <span className="ml-1 text-xs italic text-gray-300">
                                              ({rank})
                                            </span>
                                          )}
                                        </p>
                                        <p className="text-xs text-gray-300 mt-1 leading-snug">
                                          <span className="font-semibold">
                                            K/D:
                                          </span>{" "}
                                          {player.kills}/{player.deaths}{" "}
                                          <span className="mx-1">|</span>
                                          <span className="font-semibold">
                                            KD:
                                          </span>{" "}
                                          {player.kdRatio}{" "}
                                          <span className="mx-1">|</span>
                                          <span className="font-semibold">
                                            ACS:
                                          </span>{" "}
                                          {player.acs}{" "}
                                          <span className="mx-1">|</span>
                                          <span className="font-semibold">
                                            KAST:
                                          </span>{" "}
                                          {player.kast}%
                                        </p>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
          {/* New Profile Explorer Section */}
          <div className="mt-12">
            <div className="bg-gray-800 rounded-lg p-8 text-center shadow-md">
              <h2 className="text-3xl font-bold text-gray-100 mb-2">
                Profile Explorer
              </h2>
              <p className="text-lg text-gray-300 mb-4">
                Search for a collegiate profile by entering a Riot ID (e.g.,{" "}
                <span className="font-semibold">player#NA1</span>) or choose one
                from the suggestions.
              </p>
              <form
                onSubmit={handleProfileSearch}
                className="flex flex-col md:flex-row items-center justify-center gap-2"
              >
                <input
                  type="search"
                  placeholder="Find a profile, e.g., player#NA1 or Sage"
                  className="w-full md:w-1/2 px-4 py-2 rounded border border-gray-600 bg-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none"
                  list="profile-options"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setProfileNotLoggedIn(false);
                  }}
                />
                <datalist id="profile-options">
                  <option value="ZambieD#whale" />
                  <option value="AlphaA1#NJAA" />
                  <option value="AlphaA2#NJAA" />
                  <option value="BetaB1#NJAB" />
                  <option value="BetaB2#NJAB" />
                </datalist>
                <button
                  type="submit"
                  className="mt-2 md:mt-0 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-semibold"
                >
                  Search Profile
                </button>
              </form>
              {/* Disclaimer with inline "Make Private" link */}
              <p className="text-xs text-gray-500 mt-4">
                By signing in, you acknowledge that your profile becomes public.{" "}
                <a
                  href="/auth/riot?private=true"
                  className="underline hover:text-blue-400"
                >
                  Make Private
                </a>
              </p>
              {/* If the profile is not found, show an additional prompt */}
              {profileNotLoggedIn && (
                <div className="mt-4 text-center">
                  <p className="text-lg text-red-400">
                    The profile{" "}
                    <span className="font-bold">{searchedProfile}</span> has not
                    been logged in.
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Is this your account?{" "}
                    <a
                      href="/auth/riot?private=true"
                      className="underline hover:text-blue-400"
                    >
                      Sign in to claim it.
                    </a>
                  </p>
                  <p className="text-xs text-gray-500 mt-4">
                    Disclaimer: You must sign in with Riot to opt in for
                    displaying your stats. Your data will only be shown if you
                    have logged into our service.{" "}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    you may opt out at any time by clicking the "Make Private"
                    link shown above.{" "}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <AnimatePresence>
        {selectedPlayer && selectedPlayerStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-6"
          >
            <motion.div
              key="modal"
              ref={modalRef}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl shadow-2xl p-8 relative max-w-5xl w-full overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-100 text-xl"
              >
                ✕
              </button>
              <div className="flex flex-wrap md:flex-nowrap items-center justify-between pb-6 border-b border-gray-700 gap-4">
                <div>
                  <p className="text-sm text-gray-500">
                    {selectedPlayerStats.myTeamName}
                  </p>
                  <h2 className="text-3xl font-bold text-white">
                    {selectedPlayer.name}#{selectedPlayer.tagline}
                  </h2>
                  <p
                    className={`text-lg font-semibold ${
                      selectedPlayerStats.matchOutcome === "Victory"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {selectedPlayerStats.matchOutcome}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-gray-300 text-sm">
                    <span className="font-bold">Map:</span>{" "}
                    {selectedPlayerStats.mapPlayed}
                  </p>
                  <p className="text-gray-300 text-sm">
                    <span className="font-bold">Duration:</span>{" "}
                    {selectedPlayerStats.matchDuration}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <StatBox
                  label="Combat Score"
                  value={selectedPlayerStats.generalStats.combatScore}
                  color="teal"
                />
                <StatBox
                  label="Kills"
                  value={selectedPlayerStats.generalStats.kills}
                  color="yellow"
                />
                <StatBox
                  label="Deaths"
                  value={selectedPlayerStats.generalStats.deaths}
                  color="red"
                />
                <StatBox
                  label="Assists"
                  value={selectedPlayerStats.generalStats.assists}
                  color="blue"
                />
                <StatBox
                  label="KDA"
                  value={selectedPlayerStats.generalStats.kda}
                  color="purple"
                />
                <StatBox
                  label="Damage/Round"
                  value={selectedPlayerStats.generalStats.damagePerRound}
                  color="pink"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <StatBox
                  label="First Bloods"
                  value={
                    selectedPlayerStats.additionalStats?.firstBloods ?? "N/A"
                  }
                  color="green"
                />
                <StatBox
                  label="Clutches"
                  value={selectedPlayerStats.additionalStats?.clutches ?? "N/A"}
                  color="teal"
                />
                <StatBox
                  label="Most Kills in a Round"
                  value={
                    selectedPlayerStats.additionalStats?.highestKillsInRound ??
                    "N/A"
                  }
                  color="blue"
                />
                <StatBox
                  label="Headshot %"
                  value={
                    selectedPlayerStats.additionalStats?.headshotPercent ??
                    "N/A"
                  }
                  color="yellow"
                />
              </div>
              <div className="bg-gray-700 p-4 rounded-lg mt-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Match Details
                </h3>
                <p className="text-gray-300 mb-1">
                  <span className="font-bold text-teal-300">Final Score:</span>{" "}
                  {selectedPlayerStats.matchScore}
                </p>
                <p className="text-gray-300 mb-1">
                  <span className="font-bold text-teal-300">Total Rounds:</span>{" "}
                  {selectedPlayerStats.totalRounds}
                </p>
                <p className="text-gray-300">
                  <span className="font-bold text-teal-300">Winning Team:</span>{" "}
                  {selectedPlayerStats.matchOutcome === "Victory"
                    ? selectedPlayerStats.myTeamName
                    : selectedPlayerStats.enemyTeamName}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                  <h4 className="text-xl font-bold text-gray-100 mb-3 border-b border-gray-700 pb-2">
                    {selectedPlayerStats.myTeamName}
                  </h4>
                  {selectedPlayerStats.myTeam.map((pl, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-700 p-3 rounded mb-2 text-sm text-gray-300 hover:bg-gray-600 transition relative"
                    >
                      <p className="text-gray-100 font-semibold">
                        {pl.playerName}
                      </p>
                      <p className="leading-snug mt-1">
                        Score: {pl.score} | K/D: {pl.kd} | Econ: {pl.econ} |
                        Plants: {pl.plants} | Defuses: {pl.defuses}
                      </p>
                    </motion.div>
                  ))}
                </div>
                <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                  <h4 className="text-xl font-bold text-gray-100 mb-3 border-b border-gray-700 pb-2">
                    {selectedPlayerStats.enemyTeamName}
                  </h4>
                  {selectedPlayerStats.enemyTeam.map((pl, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-700 p-3 rounded mb-2 text-sm text-gray-300 hover:bg-gray-600 transition relative"
                    >
                      <p className="text-gray-100 font-semibold">
                        {pl.playerName}
                      </p>
                      <p className="leading-snug mt-1">
                        Score: {pl.score} | K/D: {pl.kd} | Econ: {pl.econ} |
                        Plants: {pl.plants} | Defuses: {pl.defuses}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
              <AnimatePresence>
                {selectedPlayerStats.weaponStats &&
                  selectedPlayerStats.weaponStats.length > 0 && (
                    <div className="mt-10">
                      <h3 className="text-2xl font-bold text-white mb-4">
                        Weapon Stats
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedPlayerStats.weaponStats.map((weapon, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition relative"
                          >
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-transparent via-white/5 to-transparent blur opacity-0 hover:opacity-10 transition"></div>
                            <h4 className="text-xl font-semibold text-white mb-2">
                              {weapon.weaponName}
                            </h4>
                            <p className="text-gray-300">
                              <span className="font-bold text-green-400">
                                Kills:
                              </span>{" "}
                              {weapon.totalKills}
                            </p>
                            <p className="text-gray-300">
                              <span className="font-bold text-yellow-400">
                                Headshot %:
                              </span>{" "}
                              {weapon.headshotPercent.toFixed(1)}%
                            </p>
                            <p className="text-gray-300">
                              <span className="font-bold text-blue-400">
                                Avg. Damage:
                              </span>{" "}
                              {weapon.avgDamage.toFixed(1)}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
              </AnimatePresence>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg text-white font-semibold"
                >
                  {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
                </button>
                {selectedPlayer &&
                  isRadiantOrImmortal(
                    getPlayerRank(selectedPlayer.name, selectedPlayer.tagline)
                  ) && (
                    <button
                      onClick={() =>
                        handleToggleRankedStats(
                          selectedPlayer.name,
                          selectedPlayer.tagline
                        )
                      }
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg shadow-lg text-white font-semibold"
                    >
                      {showRankedStats
                        ? "Hide Ranked Stats"
                        : "View Ranked Stats"}
                    </button>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
