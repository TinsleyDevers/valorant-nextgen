// news.js
import React from "react";
import { Link } from "react-router-dom";

function News() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-extrabold text-gray-100 mb-6">
          Latest News
        </h1>

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

        <div className="mt-8">
          <Link to="/" className="text-red-400 hover:text-red-300 underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default News;
