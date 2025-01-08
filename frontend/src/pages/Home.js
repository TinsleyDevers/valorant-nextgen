//Home.js
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
    }[color] || "text-teal-300";

  return (
    <div className="p-2 bg-gray-800 rounded">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-lg font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}

function TeamTable({ title, data }) {
  return (
    <div className="bg-gray-700 p-4 rounded mt-4">
      <h4 className="font-semibold text-lg text-gray-200 mb-2">{title}</h4>
      {data && data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-300 mb-4">
            <thead className="text-xs uppercase bg-gray-700 text-gray-400">
              <tr>
                <th className="px-3 py-2">Player</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">K/D</th>
                <th className="px-3 py-2">Econ</th>
                <th className="px-3 py-2">Plants</th>
                <th className="px-3 py-2">Defuses</th>
              </tr>
            </thead>
            <tbody>
              {data.map((pl, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-600 last:border-b-0 hover:bg-gray-800 transition duration-200"
                >
                  <td className="px-3 py-2">{pl.playerName}</td>
                  <td className="px-3 py-2 text-center">{pl.score}</td>
                  <td className="px-3 py-2 text-center">{pl.kd}</td>
                  <td className="px-3 py-2 text-center">{pl.econ}</td>
                  <td className="px-3 py-2 text-center">{pl.plants}</td>
                  <td className="px-3 py-2 text-center">{pl.defuses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">No data available.</p>
      )}
    </div>
  );
}

export default function Home() {
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

  // riot personal key stuff
  const [riotUsername, setRiotUsername] = useState("ZambieD");
  const [riotTagline, setRiotTagline] = useState("whale");
  const [riotAccountData, setRiotAccountData] = useState(null);
  const [riotError, setRiotError] = useState("");
  const [loadingAccount, setLoadingAccount] = useState(false);

  // minimaps
  const minimaps = {
    Ascent:
      "https://static.wikia.nocookie.net/valorant/images/0/04/Ascent_minimap.png",
    Bind: "https://static.wikia.nocookie.net/valorant/images/e/e6/Bind_minimap.png",
    Haven:
      "https://static.wikia.nocookie.net/valorant/images/2/25/Haven_minimap.png",
    Icebox:
      "https://static.wikia.nocookie.net/valorant/images/c/cf/Icebox_minimap.png",
  };

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
      if (modalRef.current && !modalRef.current.contains(e.target))
        closeModal();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // anims
  const leagueButtonVariant = {
    rest: { scale: 1, opacity: 0.8 },
    hover: { scale: 1.05, opacity: 1 },
  };
  const matchesContainerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const matchItemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 },
  };

  const handleLeagueToggle = (league) =>
    setSelectedLeague(selectedLeague === league ? null : league);
  const toggleMatchExpand = (matchId) => {
    setExpandedMatchIds(
      expandedMatchIds.includes(matchId)
        ? expandedMatchIds.filter((id) => id !== matchId)
        : [...expandedMatchIds, matchId]
    );
  };
  const closeModal = () => {
    setSelectedPlayer(null);
    setSelectedPlayerStats(null);
    setSelectedRankedStats(null);
    setShowHeatmap(false);
    setShowRankedStats(false);
  };

  // leagues
  const filteredMatches = selectedLeague
    ? matches.filter(
        (m) => m.tournament.toLowerCase() === selectedLeague.toLowerCase()
      )
    : [];

  // rank logic
  const getPlayerRank = (n, t) => {
    const lb = leaderboard.find((p) => p.name === n && p.tagline === t);
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
          {
            params: { name: n, tagline: t },
          }
        );
        setSelectedRankedStats(r.data.rankedStats);
      } catch {}
      setShowRankedStats(true);
    } else {
      setShowRankedStats(false);
      setSelectedRankedStats(null);
    }
  };

  // production key example usages
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
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Valorant Collegiate Next-Gen
          </h1>
          {/* League Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            <motion.div
              variants={leagueButtonVariant}
              initial="rest"
              whileHover="hover"
            >
              <button
                className={`px-4 py-2 rounded ${
                  selectedLeague === "NJAACE" ? "bg-red-600" : "bg-gray-700"
                } hover:bg-red-500 transition`}
                onClick={() => handleLeagueToggle("NJAACE")}
              >
                NJAACE
              </button>
            </motion.div>
            <motion.div
              variants={leagueButtonVariant}
              initial="rest"
              whileHover="hover"
            >
              <button
                className={`px-4 py-2 rounded ${
                  selectedLeague === "Southern Esports Conference"
                    ? "bg-red-600"
                    : "bg-gray-700"
                } hover:bg-red-500 transition`}
                onClick={() =>
                  handleLeagueToggle("Southern Esports Conference")
                }
              >
                Southern Esports Conference
              </button>
            </motion.div>
          </div>

          {selectedLeague ? (
            <motion.div
              variants={matchesContainerVariants}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              {filteredMatches.map((match) => {
                const isExpanded = expandedMatchIds.includes(match.matchId);
                const t0 = match.teams[0].roundsWon,
                  t1 = match.teams[1].roundsWon;
                const leftWinner = t0 > t1,
                  rightWinner = t1 > t0;
                return (
                  <motion.div
                    key={match.matchId}
                    variants={matchItemVariants}
                    className="relative rounded-lg overflow-hidden shadow-lg cursor-pointer"
                    onClick={() => toggleMatchExpand(match.matchId)}
                  >
                    <div className="relative">
                      <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-sm"
                        style={{ backgroundImage: `url(${match.mapImage})` }}
                      ></div>
                      <div className="absolute inset-0 bg-black bg-opacity-45"></div>
                      <div className="relative p-4 flex justify-between items-center">
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            {match.teams[0].name} vs {match.teams[1].name}
                          </h2>
                          <p className="text-sm text-gray-300">
                            {match.map} | {match.date}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <img
                              src={match.teams[0].teamLogo}
                              alt="Team0"
                              className="w-8 h-8 object-contain"
                            />
                            <span
                              className={`px-2 py-1 rounded text-white ${
                                leftWinner ? "bg-green-600" : "bg-red-600"
                              }`}
                            >
                              {t0}
                            </span>
                            <span className="font-bold text-white">-</span>
                            <span
                              className={`px-2 py-1 rounded text-white ${
                                rightWinner ? "bg-green-600" : "bg-red-600"
                              }`}
                            >
                              {t1}
                            </span>
                            <img
                              src={match.teams[1].teamLogo}
                              alt="Team1"
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMatchExpand(match.matchId);
                            }}
                            className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
                          >
                            {isExpanded ? "Hide Details" : "View Details"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* expanded match details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4 }}
                          className="bg-gray-800 px-4 py-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {match.teams.map((team, idx) => (
                              <div
                                key={idx}
                                className="bg-gray-700 p-3 rounded space-y-2"
                              >
                                <h4 className="font-semibold text-lg mb-2 text-gray-200">
                                  {team.name}
                                </h4>
                                {team.players.map((player, i) => {
                                  const rank = getPlayerRank(
                                    player.name,
                                    player.tagline
                                  );
                                  const special = isRadiantOrImmortal(rank);
                                  let rankClass =
                                    "text-gray-300 hover:text-gray-100";
                                  if (special) {
                                    if (rank?.toLowerCase().includes("radiant"))
                                      rankClass =
                                        "text-yellow-300 hover:text-yellow-200 border-l-4 border-yellow-300 pl-2";
                                    else if (
                                      rank?.toLowerCase().includes("immortal")
                                    )
                                      rankClass =
                                        "text-pink-300 hover:text-pink-200 border-l-4 border-pink-300 pl-2";
                                  }
                                  return (
                                    <div
                                      key={i}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePlayerClick(
                                          match.matchId,
                                          player
                                        );
                                      }}
                                      className={`flex flex-col border-b border-gray-600 py-2 last:border-b-0 cursor-pointer transition hover:bg-gray-600 ${rankClass}`}
                                    >
                                      <span>
                                        {player.name}#{player.tagline}
                                        {rank && (
                                          <span className="ml-2 text-xs italic text-gray-400">
                                            ({rank})
                                          </span>
                                        )}
                                      </span>
                                      <span className="text-sm text-gray-400">
                                        K/D: {player.kills}/{player.deaths} |
                                        KD: {player.kdRatio} | ACS: {player.acs}{" "}
                                        | KAST: {player.kast}%
                                      </span>
                                    </div>
                                  );
                                })}
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
          ) : (
            <p className="text-center text-gray-400">
              Please select a league above.
            </p>
          )}

          {/* developer key demo */}
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-2">
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
                className="flex-1 px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Tagline"
                value={riotTagline}
                onChange={(e) => setRiotTagline(e.target.value)}
                className="flex-1 px-3 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded text-white"
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
                  <h3 className="font-semibold text-lg mb-2">Account Data</h3>
                  <p>PUUID: {riotAccountData.puuid}</p>
                  <p>GameName: {riotAccountData.gameName}</p>
                  <p>TagLine: {riotAccountData.tagLine}</p>
                </div>
              )
            )}
          </div>
        </div>
      )}
      <AnimatePresence>
        {selectedPlayer && selectedPlayerStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              key="modal"
              ref={modalRef}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="stats-modal bg-gray-800 rounded-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>

              {/* Player Name */}
              <div className="text-center mb-2">
                <p className="text-2xl font-bold text-gray-300">
                  {selectedPlayer.name}#{selectedPlayer.tagline}
                </p>
              </div>

              {/* Victory/Defeat Section */}
              <div className="text-center mb-4">
                <p
                  className={`text-2xl font-bold ${
                    selectedPlayerStats.matchOutcome === "Victory"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {selectedPlayerStats.matchOutcome}
                </p>
                <p className="text-gray-200 text-xl font-bold">
                  {selectedPlayerStats.matchScore} •{" "}
                  {selectedPlayerStats.howLongAgo}
                </p>
              </div>

              {selectedPlayerStats.analysis?.map((a, i) => (
                <div
                  key={i}
                  className="bg-gray-700 p-3 rounded mb-2 text-sm text-gray-300"
                >
                  {a.text}
                </div>
              ))}

              {/** Damage Comparison */}
              {selectedPlayerStats.damageComparison && (
                <div className="bg-gray-700 p-4 rounded mb-4 flex flex-col md:flex-row items-center justify-around">
                  <div className="text-center mb-2 md:mb-0">
                    <p className="text-sm text-gray-400 mb-1">
                      {selectedPlayerStats.damageComparison.matchDamageLabel}
                    </p>
                    <p className="text-lg text-teal-300 font-bold">
                      {selectedPlayerStats.damageComparison.thisMatchDamage}{" "}
                      Damage
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">
                      {selectedPlayerStats.damageComparison.averageDamageLabel}
                    </p>
                    <p className="text-lg text-purple-300 font-bold">
                      {selectedPlayerStats.damageComparison.averageDamage}{" "}
                      Damage
                    </p>
                  </div>
                </div>
              )}

              {/** General Stats */}
              {selectedPlayerStats.generalStats && (
                <div className="bg-gray-700 p-4 rounded mb-4">
                  <h3 className="font-semibold text-lg mb-2 text-gray-200">
                    General Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    <StatBox
                      label="Combat Score"
                      value={selectedPlayerStats.generalStats.combatScore}
                      color="teal"
                    />
                    <StatBox
                      label="KDA"
                      value={selectedPlayerStats.generalStats.kda}
                      color="purple"
                    />
                    <StatBox
                      label="Kills"
                      value={selectedPlayerStats.generalStats.kills}
                      color="yellow"
                    />
                    <StatBox
                      label="Deaths"
                      value={selectedPlayerStats.generalStats.deaths}
                      color="pink"
                    />
                    <StatBox
                      label="Assists"
                      value={selectedPlayerStats.generalStats.assists}
                      color="blue"
                    />
                    <StatBox
                      label="Damage / Round"
                      value={selectedPlayerStats.generalStats.damagePerRound}
                      color="teal"
                    />
                  </div>
                </div>
              )}

              {/* Match Details */}
              <div className="bg-gray-700 p-4 rounded mb-4">
                <h4 className="font-semibold text-lg text-gray-200 mb-3">
                  Match Details
                </h4>

                {/* Map Name */}
                <p className="text-gray-300 mb-2">
                  <span className="font-bold text-teal-300">Map:</span>{" "}
                  {selectedPlayerStats.mapPlayed}
                </p>

                {/* Match Duration */}
                <p className="text-gray-300 mb-2">
                  <span className="font-bold text-teal-300">
                    Match Duration:
                  </span>{" "}
                  {selectedPlayerStats.matchDuration || "Unavailable"}
                </p>

                {/* Final Score */}
                <p className="text-gray-300 mb-2">
                  <span className="font-bold text-teal-300">Final Score:</span>{" "}
                  {selectedPlayerStats.matchScore}
                </p>

                {/* Total Rounds Played */}
                <p className="text-gray-300 mb-2">
                  <span className="font-bold text-teal-300">Total Rounds:</span>{" "}
                  {selectedPlayerStats.totalRounds || "Unavailable"}
                </p>

                {/* Winning Team */}
                <p className="text-gray-300 mb-2">
                  <span className="font-bold text-teal-300">Winning Team:</span>{" "}
                  {selectedPlayerStats.matchOutcome === "Victory"
                    ? selectedPlayerStats.myTeamName
                    : selectedPlayerStats.enemyTeamName}
                </p>
              </div>

              {/** Weapon Stats */}
              {selectedPlayerStats.weaponStats?.length ? (
                <div className="bg-gray-700 p-4 rounded mb-4">
                  <h4 className="font-semibold text-lg text-gray-200 mb-2">
                    Weapon Stats
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-gray-300">
                      <thead className="text-xs uppercase bg-gray-700 text-gray-400">
                        <tr>
                          <th className="px-4 py-2 text-left">Weapon</th>
                          <th className="px-4 py-2 text-center">Total Kills</th>
                          <th className="px-4 py-2 text-center">Kills/Round</th>
                          <th className="px-4 py-2 text-center">HS%</th>
                          <th className="px-4 py-2 text-center">Avg. Damage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...selectedPlayerStats.weaponStats]
                          .sort((a, b) => b.totalKills - a.totalKills)
                          .map((weapon, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-gray-800 transition duration-200"
                            >
                              <td className="px-4 py-2 text-left font-semibold text-gray-200">
                                {weapon.weaponName}
                              </td>
                              <td className="px-4 py-2 text-center text-teal-400">
                                {weapon.totalKills}
                              </td>
                              <td className="px-4 py-2 text-center text-yellow-300">
                                {weapon.killsPerRound.toFixed(2)}
                              </td>
                              <td className="px-4 py-2 text-center text-pink-300">
                                {weapon.headshotPercent.toFixed(1)}%
                              </td>
                              <td className="px-4 py-2 text-center text-blue-300">
                                {weapon.avgDamage.toFixed(1)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No weapon stats available.</p>
              )}

              {/** Team Stats */}
              <TeamTable
                title={selectedPlayerStats.myTeamName}
                data={selectedPlayerStats.myTeam}
              />
              <TeamTable
                title={selectedPlayerStats.enemyTeamName}
                data={selectedPlayerStats.enemyTeam}
              />

              {/** Heatmap and Ranked Stats */}
              <div className="mt-4">
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded text-white mr-2"
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
                    className="bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded text-white"
                  >
                    {showRankedStats
                      ? "Hide Ranked Stats"
                      : "View Ranked Stats"}
                  </button>
                )}
              </div>

              {/** Heatmap */}
              {showHeatmap && (
                <div className="mt-4 relative bg-gray-700 p-3 rounded">
                  <div
                    className="w-full h-64 relative"
                    style={{
                      background: `url('${
                        minimaps[selectedPlayerStats.mapPlayed] ||
                        "/map-heatmap.png"
                      }') no-repeat top center / cover`,
                    }}
                  >
                    {selectedPlayerStats.killLocations.map((l, i) => (
                      <div
                        key={`kill-${i}`}
                        className="absolute w-4 h-4 bg-green-500 rounded-full opacity-90"
                        style={{
                          left: `${l.x / 10}%`,
                          top: `${l.y / 10}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    ))}
                    {selectedPlayerStats.deathLocations.map((l, i) => (
                      <div
                        key={`death-${i}`}
                        className="absolute w-4 h-4 bg-red-500 rounded-full opacity-90"
                        style={{
                          left: `${l.x / 10}%`,
                          top: `${l.y / 10}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Ranked Stats */}
              <AnimatePresence>
                {showRankedStats && selectedRankedStats && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 p-3 bg-gray-700 rounded"
                  >
                    <h4 className="font-semibold mb-2">Ranked Stats</h4>
                    <p className="text-gray-300">
                      Username: {selectedPlayer.name}#{selectedPlayer.tagline}
                    </p>
                    <p className="text-gray-300">
                      Rank: {selectedRankedStats.rank}
                    </p>
                    <p className="text-gray-300">
                      RR: {selectedRankedStats.rr}
                    </p>
                    <p className="text-gray-300">
                      Wins: {selectedRankedStats.wins}, Losses:{" "}
                      {selectedRankedStats.losses}
                    </p>
                    <p className="text-gray-300">
                      Recent Performance:{" "}
                      {selectedRankedStats.recentPerformance.join(", ")}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      ;
    </>
  );
}
