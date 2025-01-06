import React from "react";
import { Link } from "react-router-dom";

function About() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">
          About Valorant Collegiate Next-Gen
        </h1>
        <p className="text-gray-300 mb-4">
          Valorant Collegiate Next-Gen is a stats platform specifically designed
          for collegiate Valorant leagues. The goal is to bring advanced
          analytics and insights of each league to players, coaches, and fans of
          collegiate esports.
        </p>

        <h2 className="text-2xl font-semibold text-red-400 mb-3">
          Current Features
        </h2>
        <ul className="list-disc list-inside text-gray-300 mb-6">
          <li>
            Display detailed stats for custom matches, including team names,
            players, and their in-game performance.
          </li>
          <li>
            Provide ranked leaderboard data for collegiate players who are
            currently ranked as Immortal or Radiant in Valorant.
          </li>
          <li>
            Allow users to view advanced player stats such as K/D ratios, damage
            per round, economy stats, and more.
          </li>
          <li>
            Dynamic match view that highlights victory or defeat, team scores,
            and player performance.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-red-400 mb-3">
          Future Plans
        </h2>
        <ul className="list-disc list-inside text-gray-300 mb-6">
          <li>
            Expand coverage to include other collegiate leagues, such as NJCAAE,
            Southern Esports Conference (SEC), CVAL, and others.
          </li>
          <li>
            Integrate match tracking data from the Valorant API to provide
            statistics of collegiate games.
          </li>
          <li>
            Implement features like schedule tracking, team comparisons, and
            leaderboards for entire leagues.
          </li>
          <li>
            Build an analysis tool for teams and players to track their
            performance trends over time.
          </li>
        </ul>

        <p className="text-gray-300 mb-4">
          This platform is not a public stat tracker for every Valorant player
          but rather a dedicated tool to showcase the statistics of players
          within collegiate leagues. Players who are not on the ranked
          leaderboard will not have additional ranked statistics available.
        </p>

        <Link to="/" className="text-red-400 hover:text-red-300 underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default About;
