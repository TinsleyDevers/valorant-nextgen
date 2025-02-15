// server.js
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const querystring = require("querystring");

const app = express();
const PORT = process.env.PORT || 5000;

const session = require("express-session");

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true, // set to true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000, // e.g., 1 day
    },
  })
);

app.use(cors());
app.use(express.json());

// ----- Riot Sign On (RSO) Endpoints ----- //

// Start Riot OAuth flow.
app.get("/auth/riot", (req, res) => {
  const clientId = process.env.RIOT_RSO_CLIENT_ID;
  const redirectUri = process.env.RIOT_RSO_REDIRECT_URI;
  // Generate a random state and store it in session for CSRF protection
  const state = crypto.randomBytes(16).toString("hex");
  req.session.rsoState = state;

  // Define scopes as needed (here "openid account" is used as an example)
  const scope = "openid account";

  // Build the Riot OAuth authorization URL
  const authUrl =
    "https://auth.riotgames.com/authorize?" +
    querystring.stringify({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scope,
      state: state,
    });

  // Redirect the user to Riot's sign in page
  res.redirect(authUrl);
});

app.get("/auth/riot/callback", async (req, res) => {
  const { code, state } = req.query;

  // Verify the state parameter to prevent CSRF attacks
  if (!state || state !== req.session.rsoState) {
    return res.status(400).send("Invalid state parameter.");
  }
  // Clear the stored state now that it’s been used
  delete req.session.rsoState;

  try {
    // Exchange the authorization code for tokens
    const tokenResponse = await axios.post(
      "https://auth.riotgames.com/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.RIOT_RSO_REDIRECT_URI,
        client_id: process.env.RIOT_RSO_CLIENT_ID,
        client_secret: process.env.RIOT_RSO_CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Save the tokens to the session (you can later save them to a database if needed)
    req.session.tokens = tokenResponse.data;

    // Optionally, verify the id_token here using jwt.verify (see next section)

    // Redirect to your dashboard (or another protected page)
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error during token exchange:", error.message);
    res.status(500).send("Authentication failed, please try again.");
  }
});

// Logout endpoint – redirect user to Riot’s logout URL.
app.get("/auth/riot/logout", (req, res) => {
  // Clear the session
  req.session.destroy();

  const postLogoutRedirectUri = process.env.RIOT_RSO_POST_LOGOUT_URI;
  res.redirect(
    `https://auth.riotgames.com/logout?redirect_uri=${encodeURIComponent(
      postLogoutRedirectUri
    )}`
  );
});

// ----- End RSO Endpoints ----- //

app.get("/", (req, res) => {
  res.send("Server is running!");
});

const RIOT_API_KEY = process.env.RIOT_API_KEY;

app.use(cors());
app.use(express.json());

const allMatches = [
  {
    matchId: "n1",
    tournament: "NJAACE",
    date: "2025-03-15",
    map: "Ascent",
    mapImage:
      "https://static.wikia.nocookie.net/valorant/images/e/e7/Loading_Screen_Ascent.png",
    teams: [
      {
        name: "NJAACE Alpha",
        teamLogo:
          "https://static.wikia.nocookie.net/valorant_esports_gamepedia_en/images/4/4b/Bonklogo_square.png",
        roundsWon: 13,
        players: [
          {
            name: "AlphaA1",
            tagline: "NJAA",
            kills: 18,
            deaths: 12,
            acs: 220,
            kast: 72,
            kdRatio: 1.5,
          },
          {
            name: "AlphaA2",
            tagline: "NJAA",
            kills: 16,
            deaths: 15,
            acs: 210,
            kast: 69,
            kdRatio: 1.06,
          },
          {
            name: "AlphaA3",
            tagline: "NJAA",
            kills: 22,
            deaths: 11,
            acs: 245,
            kast: 75,
            kdRatio: 2.0,
          },
        ],
      },
      {
        name: "NJAACE Beta",
        teamLogo:
          "https://static.wikia.nocookie.net/valorant_esports_gamepedia_en/images/d/db/CrowCrowdlogo_square.png",
        roundsWon: 11,
        players: [
          {
            name: "BetaB1",
            tagline: "NJAB",
            kills: 14,
            deaths: 16,
            acs: 195,
            kast: 63,
            kdRatio: 0.87,
          },
          {
            name: "BetaB2",
            tagline: "NJAB",
            kills: 17,
            deaths: 13,
            acs: 210,
            kast: 68,
            kdRatio: 1.31,
          },
          {
            name: "BetaB3",
            tagline: "NJAB",
            kills: 19,
            deaths: 15,
            acs: 230,
            kast: 70,
            kdRatio: 1.26,
          },
        ],
      },
    ],
  },
  {
    matchId: "n2",
    tournament: "NJAACE",
    date: "2025-03-16",
    map: "Haven",
    mapImage:
      "https://static.wikia.nocookie.net/valorant/images/7/70/Loading_Screen_Haven.png",
    teams: [
      {
        name: "NJAACE Gamma",
        teamLogo:
          "https://static.wikia.nocookie.net/valorant_esports_gamepedia_en/images/2/2c/Equinox_Esportslogo_square.png",
        roundsWon: 6,
        players: [
          {
            name: "GammaG1",
            tagline: "NJAG",
            kills: 20,
            deaths: 15,
            acs: 210,
            kast: 70,
            kdRatio: 1.33,
          },
          {
            name: "GammaG2",
            tagline: "NJAG",
            kills: 18,
            deaths: 14,
            acs: 205,
            kast: 71,
            kdRatio: 1.28,
          },
          {
            name: "GammaG3",
            tagline: "NJAG",
            kills: 25,
            deaths: 12,
            acs: 250,
            kast: 77,
            kdRatio: 2.08,
          },
        ],
      },
      {
        name: "NJAACE Delta",
        teamLogo:
          "https://static.wikia.nocookie.net/valorant_esports_gamepedia_en/images/7/7f/Fish123logo_square.png",
        roundsWon: 13,
        players: [
          {
            name: "DeltaD1",
            tagline: "NJAD",
            kills: 14,
            deaths: 16,
            acs: 180,
            kast: 65,
            kdRatio: 0.87,
          },
          {
            name: "DeltaD2",
            tagline: "NJAD",
            kills: 16,
            deaths: 16,
            acs: 200,
            kast: 66,
            kdRatio: 1.0,
          },
          {
            name: "DeltaD3",
            tagline: "NJAD",
            kills: 21,
            deaths: 16,
            acs: 225,
            kast: 72,
            kdRatio: 1.31,
          },
        ],
      },
    ],
  },
  {
    matchId: "s1",
    tournament: "Southern Esports Conference",
    date: "2025-03-15",
    map: "Bind",
    mapImage:
      "https://static.wikia.nocookie.net/valorant/images/2/23/Loading_Screen_Bind.png",
    teams: [
      {
        name: "SEC Avengers",
        teamLogo:
          "https://static.wikia.nocookie.net/valorant_esports_gamepedia_en/images/9/94/Lemonade_Standlogo_square.png",
        roundsWon: 13,
        players: [
          {
            name: "AvengerA1",
            tagline: "SECA",
            kills: 15,
            deaths: 14,
            acs: 200,
            kast: 67,
            kdRatio: 1.07,
          },
          {
            name: "AvengerA2",
            tagline: "SECA",
            kills: 22,
            deaths: 12,
            acs: 255,
            kast: 75,
            kdRatio: 1.83,
          },
          {
            name: "AvengerA3",
            tagline: "SECA",
            kills: 11,
            deaths: 17,
            acs: 160,
            kast: 60,
            kdRatio: 0.64,
          },
        ],
      },
      {
        name: "SEC Titans",
        teamLogo:
          "https://static.wikia.nocookie.net/valorant_esports_gamepedia_en/images/4/46/Dylema_Gaminglogo_square.png",
        roundsWon: 9,
        players: [
          {
            name: "TitanT1",
            tagline: "SECT",
            kills: 13,
            deaths: 16,
            acs: 190,
            kast: 62,
            kdRatio: 0.81,
          },
          {
            name: "TitanT2",
            tagline: "SECT",
            kills: 19,
            deaths: 15,
            acs: 220,
            kast: 68,
            kdRatio: 1.26,
          },
          {
            name: "TitanT3",
            tagline: "SECT",
            kills: 16,
            deaths: 16,
            acs: 205,
            kast: 65,
            kdRatio: 1.0,
          },
        ],
      },
    ],
  },
  {
    matchId: "s2",
    tournament: "Southern Esports Conference",
    date: "2025-03-16",
    map: "Icebox",
    mapImage:
      "https://static.wikia.nocookie.net/valorant/images/1/13/Loading_Screen_Icebox.png",
    teams: [
      {
        name: "SEC Heroes",
        teamLogo:
          "https://static.wikia.nocookie.net/valorant_esports_gamepedia_en/images/e/eb/Black_Lionlogo_square.png",
        roundsWon: 13,
        players: [
          {
            name: "HeroH1",
            tagline: "SECH",
            kills: 21,
            deaths: 14,
            acs: 230,
            kast: 72,
            kdRatio: 1.5,
          },
          {
            name: "HeroH2",
            tagline: "SECH",
            kills: 15,
            deaths: 15,
            acs: 200,
            kast: 70,
            kdRatio: 1.0,
          },
          {
            name: "HeroH3",
            tagline: "SECH",
            kills: 10,
            deaths: 18,
            acs: 170,
            kast: 64,
            kdRatio: 0.55,
          },
        ],
      },
      {
        name: "SEC Legends",
        teamLogo:
          "https://static.wikia.nocookie.net/valorant_esports_gamepedia_en/images/d/d2/Ballista_Esportslogo_square.png",
        roundsWon: 8,
        players: [
          {
            name: "LegendL1",
            tagline: "SECL",
            kills: 19,
            deaths: 14,
            acs: 210,
            kast: 69,
            kdRatio: 1.35,
          },
          {
            name: "LegendL2",
            tagline: "SECL",
            kills: 16,
            deaths: 16,
            acs: 200,
            kast: 66,
            kdRatio: 1.0,
          },
          {
            name: "LegendL3",
            tagline: "SECL",
            kills: 9,
            deaths: 17,
            acs: 145,
            kast: 58,
            kdRatio: 0.53,
          },
        ],
      },
    ],
  },
];

// return matches
app.get("/api/matches", (req, res) => {
  res.json({ success: true, data: allMatches });
});

// /api/match/:matchId/player-stats endpoint (dummy implementation)
app.get("/api/match/:matchId/player-stats", (req, res) => {
  const { matchId } = req.params;
  const { name, tagline } = req.query;
  const match = allMatches.find((m) => m.matchId === matchId);
  if (!match) return res.status(404).json({ error: "Match not found" });

  let foundTeam, foundPlayer;
  for (const t of match.teams) {
    const p = t.players.find((x) => x.name === name && x.tagline === tagline);
    if (p) {
      foundTeam = t;
      foundPlayer = p;
      break;
    }
  }
  if (!foundTeam || !foundPlayer)
    return res.status(404).json({ error: "Player not found" });

  const enemyTeam = match.teams.find((t) => t !== foundTeam);
  const isVictory =
    foundTeam.roundsWon > enemyTeam.roundsWon ? "Victory" : "Defeat";
  const matchScore = `${foundTeam.roundsWon} - ${enemyTeam.roundsWon}`;
  const totalRounds = foundTeam.roundsWon + enemyTeam.roundsWon;
  const kills = foundPlayer.kills,
    deaths = foundPlayer.deaths;

  const adv = {
    mapPlayed: match.map,
    matchOutcome: isVictory,
    matchDuration: "35:31",
    matchScore: matchScore,
    totalRounds: totalRounds,
    howLongAgo: "7 hours ago",
    kills,
    deaths,
    analysis: [
      { text: "Decreased headshot % from average" },
      { text: "First Blood kills up 10%" },
    ],
    damageComparison: {
      thisMatchDamage: 160.3,
      matchDamageLabel: "This Match",
      averageDamage: 203,
      averageDamageLabel: "Recent 10 Avg",
    },
    generalStats: {
      combatScore: 254.4,
      kda: `${kills}/${deaths}/5`,
      kills,
      deaths,
      assists: 5,
      damagePerRound: 132.6,
      roundsWithKills: 14,
      multiKillRounds: 6,
      firstBloods: Math.floor(kills * 0.2),
      clutches: Math.floor(kills * 0.1),
      highestKillsInRound: Math.min(kills, 4),
      headshotPercent: (foundPlayer.kdRatio * 25 + 10).toFixed(1),
    },
    myTeamName: foundTeam.name,
    enemyTeamName: enemyTeam.name,
    myTeam: foundTeam.players.map((p) => ({
      playerName: p.name + "#" + p.tagline,
      score: 200 + Math.floor(p.kills * 3),
      kd: p.kills + "/" + p.deaths,
      econ: 3000 + Math.floor(Math.random() * 500),
      plants: Math.floor(Math.random() * 3),
      defuses: Math.floor(Math.random() * 2),
    })),
    enemyTeam: enemyTeam.players.map((p) => ({
      playerName: p.name + "#" + p.tagline,
      score: 200 + Math.floor(p.kills * 2.5),
      kd: p.kills + "/" + p.deaths,
      econ: 3000 + Math.floor(Math.random() * 500),
      plants: Math.floor(Math.random() * 3),
      defuses: Math.floor(Math.random() * 2),
    })),
    weaponStats: [
      {
        weaponName: "Vandal",
        totalKills: 10,
        killsPerRound: 1.0,
        headshotPercent: 26,
        avgDamage: 126.1,
      },
      {
        weaponName: "Operator",
        totalKills: 7,
        killsPerRound: 0.8,
        headshotPercent: 10.5,
        avgDamage: 132.1,
      },
      {
        weaponName: "Phantom",
        totalKills: 4,
        killsPerRound: 0.9,
        headshotPercent: 21.8,
        avgDamage: 118.9,
      },
    ],
  };

  res.json({
    success: true,
    matchId,
    player: { name, tagline },
    advancedStats: adv,
  });
});

app.get("/api/ranked-stats", (req, res) => {
  const { name, tagline } = req.query;
  res.json({
    success: true,
    player: { name, tagline },
    rankedStats: {
      rank: "Radiant #500",
      rr: 90,
      wins: 50,
      losses: 25,
      recentPerformance: ["W", "L", "W", "W", "L"],
    },
  });
});

app.get("/api/account", async (req, res) => {
  try {
    const { username, tagline } = req.query;
    if (!username || !tagline)
      return res.status(400).json({ error: "username & tagline required" });
    const region = "americas";
    const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
      username
    )}/${encodeURIComponent(tagline)}`;
    const response = await axios.get(url, {
      headers: { "X-Riot-Token": process.env.RIOT_API_KEY },
    });
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Error in /api/account:", error.message);
    res.status(500).json({ error: "Could not fetch account" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
