import React from "react";
import { Link } from "react-router-dom";

function News() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Latest News</h1>
        <ul className="space-y-4 text-gray-300">
          <li>
            <strong>March 1, 2025:</strong> Valorant Collegiate Next-Gen
            placeholder announcement! (pls give production key rito)
          </li>
          <li>
            <strong>February 20, 2025:</strong> NJAACE playoffs scheduled. Big
            showdown expected between NJAACE Alpha and Beta.
          </li>
          <li>
            <strong>February 5, 2025:</strong> Riot teases new Valorant changes
            for upcoming season. Could it impact how players play?
          </li>
        </ul>
        <div className="mt-6">
          <Link to="/" className="text-red-400 hover:text-red-300 underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default News;
