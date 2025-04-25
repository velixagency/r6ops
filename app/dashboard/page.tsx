"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { supabase } from "../../lib/supabase";
import { onAuthStateChanged } from "firebase/auth";

interface Resource {
  food: number;
  oil: number;
  steel: number;
  mineral: number;
  uranium: number;
  troop_levels: any;
}

export default function Dashboard() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource | null>(null);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("user_id", user.uid)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.error("Error fetching resources:", error);
        return;
      }

      setResources(data);

      // Generate insights
      const newInsights: string[] = [];
      if (data.food < 5000) {
        newInsights.push("Focus on upgrading farms to boost food production!");
      }
      if (data.oil < 3000) {
        newInsights.push("Increase oil production for better upgrades.");
      }
      setInsights(newInsights);
    });

    return () => unsubscribe();
  }, [router]);

  if (!resources) {
    return <div className="text-muted-text">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-accent mb-4">Dashboard</h1>
      <p className="text-muted-text mb-4">Your latest game data and insights.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-dark-secondary p-4 rounded-lg">
          <h2 className="text-xl text-accent">Resources</h2>
          <p className="text-muted-text">Food: {  {resources.food}</p>
          <p className="text-muted-text">Oil: {resources.oil}</p>
          <p className="text-muted-text">Steel: {resources.steel}</p>
          <p className="text-muted-text">Mineral: {resources.mineral}</p>
          <p className="text-muted-text">Uranium: {resources.uranium}</p>
        </div>
        <div className="bg-dark-secondary p-4 rounded-lg">
          <h2 className="text-xl text-accent">Insights</h2>
          {insights.length > 0 ? (
            insights.map((insight, index) => (
              <p key={index} className="text-warning">
                {insight}
              </p>
            ))
          ) : (
            <p className="text-muted-text">No insights available.</p>
          )}
        </div>
      </div>
    </div>
  );
}