// src/pages/Dashboard.js
import React from "react";
import { useSearchParams } from "react-router-dom";

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="container mx-auto py-12 px-4 text-center">
      <h1 className="text-4xl font-extrabold text-gray-100 mb-4">Dashboard</h1>
      {token ? (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md text-gray-100">
          <p>You are now signed in with Riot Sign On.</p>
          <p className="mt-4 font-mono text-xs break-words">{token}</p>
          <p className="mt-2 text-sm">
            mt-2 dashbaord placeholder text. waiting on RSO access to properly
            implement
          </p>
        </div>
      ) : (
        <p className="text-gray-400">No token found. Please sign in.</p>
      )}
    </div>
  );
}
