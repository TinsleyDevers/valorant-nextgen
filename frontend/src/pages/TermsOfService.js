// termsofservice.js
import React from "react";
import { Link } from "react-router-dom";

function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-extrabold text-gray-100 mb-6">
          Terms of Service
        </h1>
        <p className="text-gray-300 mb-4 leading-relaxed">
          By using this website, you agree to comply with the guidelines set
          forth by Riot Games’ Valorant API. You acknowledge that all data
          related to match statistics is provided in good faith and may be
          subject to accuracy constraints due to API limitations.
        </p>
        <p className="text-gray-300 mb-4 leading-relaxed">
          You will not use any data obtained from this site for commercial
          purposes without express permission. Unauthorized access or misuse of
          the Valorant API can result in termination of access.
        </p>
        <p className="text-gray-300 mb-4 leading-relaxed">
          This site is not affiliated with or endorsed by Riot Games. All
          product names, logos, and brands are property of their respective
          owners.
        </p>
        <p className="text-gray-300 leading-relaxed">
          For additional rules, please refer to Riot’s official terms at{" "}
          <a
            href="https://www.riotgames.com/en/terms-of-service"
            target="_blank"
            rel="noreferrer"
            className="text-red-500 underline"
          >
            Riot Terms of Service
          </a>
          .
        </p>

        <div className="mt-8">
          <Link to="/" className="text-red-400 hover:text-red-300 underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;
