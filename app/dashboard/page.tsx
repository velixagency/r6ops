"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";

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
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {resources ? (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold mb-2">Resources</h2>
          <p>Food: {resources.food}</p>
          <p>Oil: {resources.oil}</p>
          <p>Steel: {resources.steel}</p>
          <p>Mineral: {resources.mineral}</p>
          <p>Uranium: {resources.uranium}</p>
          <h2 className="text-xl font-semibold mb-2 mt-4">Speed-Ups</h2>
          <p>Speed Up: {formatDuration(resources.speed_up)}</p>
          <p>Building Speed Up: {formatDuration(resources.building_speed_up)}</p>
          <p>Healing Speed Up: {formatDuration(resources.healing_speed_up)}</p>
          <p>Recruitment Speed Up: {formatDuration(resources.recruitment_speed_up)}</p>
          <p>Research Speed Up: {formatDuration(resources.research_speed_up)}</p>
        </div>
      ) : (
        <p>No resources found.</p>
      )}
    </div>
  );
}