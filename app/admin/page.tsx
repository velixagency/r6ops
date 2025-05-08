"use client";

import { useState } from "react";
import Link from "next/link";
import UsersTable from "../../components/admin/UsersTable";
import GameDataTable from "../../components/admin/GameDataTable";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"users" | "gameData">("users");

  return (
    <div className="min-h-screen p-6 py-16 bg-dark-bg">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-accent-cyan mb-8 text-center">Admin Dashboard</h1>
        
        {/* Tabs Navigation */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 text-lg font-semibold rounded-l-lg transition-colors ${
              activeTab === "users"
                ? "bg-accent-cyan text-dark-bg"
                : "bg-border-metallic text-light-text hover:bg-accent-gold hover:text-dark-bg"
            }`}
          >
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab("gameData")}
            className={`px-6 py-3 text-lg font-semibold rounded-r-lg transition-colors ${
              activeTab === "gameData"
                ? "bg-accent-cyan text-dark-bg"
                : "bg-border-metallic text-light-text hover:bg-accent-gold hover:text-dark-bg"
            }`}
          >
            Manage Game Data
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-dark-bg p-6 rounded-lg shadow-metallic-glow border border-border-metallic">
          {activeTab === "users" && <UsersTable />}
          {activeTab === "gameData" && <GameDataTable />}
        </div>

        <div className="text-center mt-6">
          <Link href="/dashboard" className="text-accent-cyan hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}