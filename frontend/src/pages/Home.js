// Home.js
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
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-transparent via-white/10 to-transparent blur-xl opacity-0 hover:opacity-10 transition" />
      <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold ${colorClass} mt-1`}>{value}</p>
    </motion.div>
  );
}

export default function Home() {
  // States
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

  const modalRef = useRef(null);

  // Riot dev key demo states
  const [riotUsername, setRiotUsername] = useState("ZambieD");
  const [riotTagline, setRiotTagline] = useState("whale");
  const [riotAccountData, setRiotAccountData] = useState(null);
  const [riotError, setRiotError] = useState("");
  const [loadingAccount, setLoadingAccount] = useState(false);

  // Minimaps
  const minimaps = {
    Ascent:
      "https://static.wikia.nocookie.net/valorant/images/0/04/Ascent_minimap.png",
    Bind: "https://static.wikia.nocookie.net/valorant/images/e/e6/Bind_minimap.png",
    Haven:
      "https://static.wikia.nocookie.net/valorant/images/2/25/Haven_minimap.png",
    Icebox:
      "https://static.wikia.nocookie.net/valorant/images/c/cf/Icebox_minimap.png",
  };

  // Fetch data
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [resM, resLB] = await Promise.all([
          axios.get("https://valorant-nextgen.onrender.com/api/matches"),
          axios.get("https://valorant-nextgen.onrender.com/api/leaderboard"),
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
  }, []);

  // Animation Variants
  const leagueButtonVariant = {
    rest: { scale: 1, opacity: 0.8 },
    hover: {
      scale: 1.05,
      opacity: 1,
      transition: { duration: 0.2 },
    },
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

  // Handlers
  const handleLeagueToggle = (league) => {
    setSelectedLeague(selectedLeague === league ? null : league);
    setExpandedMatchIds([]); // reset expansions
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

  // Leaderboard rank
  const getPlayerRank = (n, t) => {
    const lb = leaderboard.find((p) => p.name === n && p.tagline === t);
    return lb ? lb.rank : null;
  };
  const isRadiantOrImmortal = (rankStr) =>
    rankStr &&
    (rankStr.toLowerCase().includes("immortal") ||
      rankStr.toLowerCase().includes("radiant"));

  // Player advanced stats
  const handlePlayerClick = async (matchId, player) => {
    closeModal();
    setSelectedPlayer(player);
    try {
      const res = await axios.get(
        `https://valorant-nextgen.onrender.com/api/match/${matchId}/player-stats`,
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
        const r = await axios.get(
          "https://valorant-nextgen.onrender.com/api/ranked-stats",
          { params: { name: n, tagline: t } }
        );
        setSelectedRankedStats(r.data.rankedStats);
      } catch {}
      setShowRankedStats(true);
    } else {
      setShowRankedStats(false);
      setSelectedRankedStats(null);
    }
  };

  // Riot dev key demo
  const handleRiotLookup = async (e) => {
    e.preventDefault();
    setRiotError("");
    setRiotAccountData(null);
    setLoadingAccount(true);
    try {
      const r = await axios.get(
        "https://valorant-nextgen.onrender.com/api/account",
        {
          params: { username: riotUsername, tagline: riotTagline },
        }
      );
      setRiotAccountData(r.data.data);
    } catch (err) {
      console.error(err);
      setRiotError(
        "Error fetching from Riot Developer API. (Rate limited/Key expired?)"
      );
    }
    setLoadingAccount(false);
  };

  return (
    <>
      <LoadingScreen isLoading={isLoading} />

      {!isLoading && (
        <div className="container mx-auto py-12 px-4">
          {/* Title */}
          <h1 className="text-4xl font-extrabold text-gray-100 text-center mb-8">
            Valorant Collegiate Next-Gen
          </h1>

          {/* League Buttons */}
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

          {/* Match Cards */}
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
                    {/* Match Card */}
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

                    {/* Expanded Match Details */}
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
                                          {player.kdRatio}
                                          <span className="mx-1">|</span>
                                          <span className="font-semibold">
                                            ACS:
                                          </span>{" "}
                                          {player.acs}
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

          {/* Riot Developer Key Demo */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-2 text-gray-100">
              Riot Developer Key Demo
            </h2>
            <p className="text-sm text-gray-400 mb-3">
              Look up a player's PUUID via the official Riot API.
            </p>
            <form
              onSubmit={handleRiotLookup}
              className="flex flex-col md:flex-row gap-2 mb-4"
            >
              <input
                type="text"
                placeholder="Username"
                value={riotUsername}
                onChange={(e) => setRiotUsername(e.target.value)}
                className="flex-1 px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none text-white"
              />
              <input
                type="text"
                placeholder="Tagline"
                value={riotTagline}
                onChange={(e) => setRiotTagline(e.target.value)}
                className="flex-1 px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none text-white"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded text-white font-semibold"
              >
                Fetch PUUID
              </button>
            </form>
            {riotError && <p className="text-red-400 mb-2">{riotError}</p>}
            {loadingAccount ? (
              <div className="bg-gray-800 p-4 rounded animate-pulse">
                <div className="h-4 bg-gray-700 w-3/4 mb-2 rounded"></div>
                <div className="h-4 bg-gray-700 w-2/3 mb-2 rounded"></div>
              </div>
            ) : (
              riotAccountData && (
                <div className="bg-gray-800 p-4 rounded">
                  <h3 className="font-semibold text-lg mb-2 text-gray-100">
                    Account Data
                  </h3>
                  <p className="text-gray-300">
                    PUUID: {riotAccountData.puuid}
                  </p>
                  <p className="text-gray-300">
                    GameName: {riotAccountData.gameName}
                  </p>
                  <p className="text-gray-300">
                    TagLine: {riotAccountData.tagLine}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Player Stats */}
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
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-100 text-xl"
              >
                ✕
              </button>

              {/* Header Section */}
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

              {/* Advanced Stats */}
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

              {/* Match Details */}
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

              {/* Teams */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* "My" (selected) Team */}
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
                {/* Enemy Team */}
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

              {/* Weapon Stats */}
              {selectedPlayerStats.weaponStats?.length > 0 && (
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
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-transparent via-white/5 to-transparent blur opacity-0 hover:opacity-10 transition" />
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

              {/* Ranked Stats */}
              {showRankedStats && selectedRankedStats && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-8 p-4 bg-gray-700 rounded-lg"
                >
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Ranked Stats
                  </h3>
                  <p className="text-gray-300 mb-1">
                    <span className="font-bold text-teal-300">Rank:</span>{" "}
                    {selectedRankedStats.rank}
                  </p>
                  <p className="text-gray-300 mb-1">
                    <span className="font-bold text-teal-300">RR:</span>{" "}
                    {selectedRankedStats.rr}
                  </p>
                  <p className="text-gray-300 mb-1">
                    <span className="font-bold text-teal-300">Wins:</span>{" "}
                    {selectedRankedStats.wins}
                  </p>
                  <p className="text-gray-300 mb-1">
                    <span className="font-bold text-teal-300">Losses:</span>{" "}
                    {selectedRankedStats.losses}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-bold text-teal-300">
                      Recent Performance:
                    </span>{" "}
                    {selectedRankedStats.recentPerformance.join(", ")}
                  </p>
                </motion.div>
              )}

              {/* Heatmap */}
              {showHeatmap && (
                <div className="mt-10 relative">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Heatmap
                  </h3>
                  <div
                    className="w-full h-64 rounded-lg shadow-lg overflow-hidden relative"
                    style={{
                      background: `url('${
                        minimaps[selectedPlayerStats.mapPlayed] ||
                        "/map-heatmap.png"
                      }') no-repeat center center / cover`,
                    }}
                  >
                    {selectedPlayerStats.killLocations.map((loc, idx) => (
                      <div
                        key={idx}
                        className="absolute w-4 h-4 bg-green-500 rounded-full animate-pulse"
                        style={{
                          left: `${loc.x / 10}%`,
                          top: `${loc.y / 10}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    ))}
                    {selectedPlayerStats.deathLocations.map((loc, idx) => (
                      <div
                        key={idx}
                        className="absolute w-4 h-4 bg-red-500 rounded-full animate-pulse"
                        style={{
                          left: `${loc.x / 10}%`,
                          top: `${loc.y / 10}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Toggle Buttons */}
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg text-white font-semibold"
                >
                  {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
                </button>
                {isRadiantOrImmortal(
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
