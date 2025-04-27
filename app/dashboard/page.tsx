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
    if (!user && !loading) {
      router.push("/submit");
    }
  
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
              errorData = { error: "Failed to parse error response" };
            }
            console.error("API error:", {
              status: response.status,
              statusText: response.statusText,
              body: errorData,
            });
            const errorMessage = errorData.error || `Failed to fetch resources: ${response.status} ${response.statusText}`;
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {resources ? (
        <div className="space-y-2">
          <p>Food: {resources.food}</p>
          <p>Oil: {resources.oil}</p>
          <p>Steel: {resources.steel}</p>
          <p>Mineral: {resources.mineral}</p>
          <p>Uranium: {resources.uranium}</p>
        </div>
      ) : (
        <p>No resources found.</p>
      )}
    </div>
  );
}