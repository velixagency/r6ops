"use client";

     import { useEffect, useState } from "react";
     import { useRouter } from "next/navigation";
     import { auth } from "../../lib/firebase";
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
       const [error, setError] = useState<string | null>(null);
       const [loading, setLoading] = useState(true);

       useEffect(() => {
         const unsubscribe = onAuthStateChanged(auth, async (user) => {
           if (!user) {
             router.push("/login");
             return;
           }

           try {
             console.log("Fetching resources for user_id:", user.uid);
             const response = await fetch(`/api/get-resources?user_id=${user.uid}`);
             const result = await response.json();

             console.log("API response:", JSON.stringify(result, null, 2));
             if (!response.ok) {
               console.error("API error:", JSON.stringify(result, null, 2));
               setError(`Failed to load resources: ${result.error || "Unknown error"}`);
               return;
             }

             if (!result.data) {
               setError("No resources found for this user. Submit data to start.");
               return;
             }

             setResources(result.data);

             const newInsights: string[] = [];
             if (result.data.food < 5000) {
               newInsights.push("Focus on upgrading farms to boost food production!");
             }
             if (result.data.oil < 3000) {
               newInsights.push("Increase oil production for better upgrades.");
             }
             setInsights(newInsights);
           } catch (err: any) {
             console.error("Unexpected error:", JSON.stringify(err, null, 2));
             setError(`Unexpected error: ${err.message || "Unknown error"}`);
           } finally {
             setLoading(false);
           }
         });

         return () => unsubscribe();
       }, [router]);

       if (loading) {
         return <div className="text-muted-text">Loading...</div>;
       }

       if (error) {
         return <div className="text-warning">{error}</div>;
       }

       if (!resources) {
         return <div className="text-muted-text">No data available.</div>;
       }

       return (
         <div>
           <h1 className="text-3xl font-bold text-accent mb-4">Dashboard</h1>
           <p className="text-muted-text mb-4">Your latest game data and insights.</p>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-dark-secondary p-4 rounded-lg">
               <h2 className="text-xl text-accent">Resources</h2>
               <p className="text-muted-text">Food: {resources.food}</p>
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