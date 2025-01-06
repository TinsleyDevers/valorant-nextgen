import React from "react";
import { Link } from "react-router-dom";

function Schedule() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Upcoming Schedule</h1>
        <p className="text-gray-300 mb-4">
          Placeholder schedule for upcoming collegiate matches.
        </p>
        <table className="min-w-full bg-gray-800 rounded">
          <thead className="bg-gray-700 text-gray-300 text-sm uppercase">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">League</th>
              <th className="px-4 py-2">Teams</th>
              <th className="px-4 py-2">Map</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr>
              <td className="px-4 py-2 border-b border-gray-600">2025-03-25</td>
              <td className="px-4 py-2 border-b border-gray-600">NJAACE</td>
              <td className="px-4 py-2 border-b border-gray-600">
                NJAACE Alpha vs NJAACE Gamma
              </td>
              <td className="px-4 py-2 border-b border-gray-600">Ascent</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border-b border-gray-600">2025-03-27</td>
              <td className="px-4 py-2 border-b border-gray-600">
                Southern Esports Conference
              </td>
              <td className="px-4 py-2 border-b border-gray-600">
                SEC Avengers vs SEC Heroes
              </td>
              <td className="px-4 py-2 border-b border-gray-600">Icebox</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-6">
          <Link to="/" className="text-red-400 hover:text-red-300 underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Schedule;
