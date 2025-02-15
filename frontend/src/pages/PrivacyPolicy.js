// privacypolicy.js
import React from "react";
import { Link } from "react-router-dom";

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-extrabold text-gray-100 mb-6">
          Privacy Policy
        </h1>

        <p className="text-gray-300 mb-4 leading-relaxed">
          We respect your privacy and adhere to Riot Games’ requirements for
          data handling. This site uses Riot’s Valorant API in accordance with
          their Developer Terms of Service. We do not store or sell personal
          data. All stats are retrieved in real time from official endpoints,
          and all user-generated data is anonymized or secured.
        </p>
        <p className="text-gray-300 mb-4 leading-relaxed">
          We comply with all relevant regulations regarding data protection.
          Should any user wish to remove their data, they may contact us
          directly, and we will ensure their data is deleted from our records.
        </p>
        <p className="text-gray-300 leading-relaxed">
          For more information on Valorant’s privacy policy, please refer to
          Riot’s official documentation at{" "}
          <a
            href="https://www.riotgames.com/en/privacy-notice"
            target="_blank"
            rel="noreferrer"
            className="text-red-500 underline"
          >
            Riot Privacy Notice
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

export default PrivacyPolicy;
