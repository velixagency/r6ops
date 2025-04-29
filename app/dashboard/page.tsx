"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [resources, setResources] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      console.log("User object:", user);
      console.log("User UID:", user.uid, "Length:", user.uid.length);
      const fetchResources = async () => {
        try {
          const response = await fetch(`/api/get-resources?user_id=${user.uid}`);
          if (!response.ok) {
            let errorData;
            try {
              errorData = await response.json();
            } catch (parseErr) {
              errorData = { error: "Failed to parse error response from API" };
            }
            console.error("API error:", {
              status: response.status,
              statusText: response.statusText,
              body: errorData,
            });
            const errorMessage = errorData.message || errorData.error || `Failed to fetch resources: ${response.status} ${response.statusText}`;
            throw new Error(errorMessage);
          }
          const result = await response.json();
          console.log("API response:", result);
          if (result.data) {
            setResources(result.data);
          }
        } catch (err: any) {
          console.error("Fetch error:", err);
          setError(err.message || "Failed to load resources");
        }
      };
      fetchResources();
    }
  }, [user, loading, router]);

  // Helper function to format seconds into days, hours, minutes, seconds
  const formatDuration = (totalSeconds: number): string => {
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    totalSeconds %= 24 * 60 * 60;
    const hours = Math.floor(totalSeconds / (60 * 60));
    totalSeconds %= 60 * 60;
    const minutes = Math.floor(totalSeconds / (60));
    const seconds = totalSeconds % 60;
    return `${days}d ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return <div className="text-light-text text-lg">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-accent-cyan">Dashboard</h1>
          <Link
            href="/submit"
            className="bg-accent-cyan text-dark-bg font-semibold px-4 py-2 rounded-lg hover:bg-accent-green hover:text-dark-bg transition-colors shadow-cyan-glow"
          >
            Submit Resources
          </Link>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {resources ? (
          <div className="space-y-8">
            <div className="bg-dark-panel backdrop-blur-10 p-6 rounded-lg border border-border-glow shadow-cyan-glow">
              <h2 className="text-2xl font-semibold text-accent-cyan mb-4">Resources</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-light-text">
                <p><span className="font-medium text-accent-green">Food:</span> {resources.food.toLocaleString()}</p>
                <p><span className="font-medium text-accent-green">Oil:</span> {resources.oil.toLocaleString()}</p>
                <p><span className="font-medium text-accent-green">Steel:</span> {resources.steel.toLocaleString()}</p>
                <p><span className="font-medium text-accent-green">Mineral:</span> {resources.mineral.toLocaleString()}</p>
                <p><span className="font-medium text-accent-green">Uranium:</span> {resources.uranium.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-dark-panel backdrop-blur-10 p-6 rounded-lg border border-border-glow shadow-cyan-glow">
              <h2 className="text-2xl font-semibold text-accent-cyan mb-4">Speed-Ups</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-light-text">
                <p><span className="font-medium text-accent-green">Speed Up:</span> {formatDuration(resources.speed_up)}</p>
                <p><span className="font-medium text-accent-green">Building Speed Up:</span> {formatDuration(resources.building_speed_up)}</p>
                <p><span className="font-medium text-accent-green">Healing Speed Up:</span> {formatDuration(resources.healing_speed_up)}</p>
                <p><span className="font-medium text-accent-green">Recruitment Speed Up:</span> {formatDuration(resources.recruitment_speed_up)}</p>
                <p><span className="font-medium text-accent-green">Research Speed Up:</span> {formatDuration(resources.research_speed_up)}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-light-text">No resources found.</p>
        )}
      </div>
    </div>
  );
}