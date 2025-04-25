"use client";

     import { useState, useEffect } from "react";
     import { useRouter } from "next/navigation";
     import { auth } from "../../lib/firebase";
     import { onAuthStateChanged } from "firebase/auth";

     export default function Submit() {
       const router = useRouter();
       const [formData, setFormData] = useState({
         food: 0,
         oil: 0,
         steel: 0,
         mineral: 0,
         uranium: 0,
         troop_levels: {},
       });
       const [error, setError] = useState<string | null>(null);
       const [success, setSuccess] = useState<string | null>(null);
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

             if (!response.ok) {
               console.error("API error:", JSON.stringify(result, null, 2));
               setError(`Failed to load resources: ${result.error || "Unknown error"}`);
               return;
             }

             if (result.data) {
               setFormData({
                 food: result.data.food || 0,
                 oil: result.data.oil || 0,
                 steel: result.data.steel || 0,
                 mineral: result.data.mineral || 0,
                 uranium: result.data.uranium || 0,
                 troop_levels: result.data.troop_levels || {},
               });
             }
           } catch (err: any) {
             console.error("Unexpected error fetching resources:", JSON.stringify(err, null, 2));
             setError(`Unexpected error: ${err.message || "Unknown error"}`);
           } finally {
             setLoading(false);
           }
         });

         return () => unsubscribe();
       }, [router]);

       const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
         const { name, value } = e.target;
         setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
       };

       const handleSubmit = async (e: React.FormEvent) => {
         e.preventDefault();
         setError(null);
         setSuccess(null);

         const user = auth.currentUser;
         if (!user) {
           setError("You must be logged in to submit data.");
           return;
         }

         try {
           const idToken = await user.getIdToken();
           console.log("Submitting resources for user_id:", user.uid, "with token:", idToken.slice(0, 10) + "...");
           const response = await fetch("/api/submit-resources", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.uid,
              food: formData.food,
              oil: formData.oil,
              steel: formData.steel,
              mineral: formData.mineral,
              uranium: formData.uranium,
              troop_levels: formData.troop_levels,
            }),
          });

           const result = await response.json();
           console.log("API response:", JSON.stringify(result, null, 2));
           if (!response.ok) {
             console.error("API error:", JSON.stringify(result, null, 2));
             setError(`Failed to submit resources: ${result.error || "Unknown error"}`);
             return;
           }

           setSuccess("Resources submitted successfully!");
           setTimeout(() => router.push("/dashboard"), 2000);
         } catch (err: any) {
           console.error("Unexpected error submitting resources:", JSON.stringify(err, null, 2));
           setError(`Unexpected error: ${err.message || "Unknown error"}`);
         }
       };

       if (loading) {
         return <div className="text-muted-text">Loading...</div>;
       }

       return (
         <div className="flex flex-col items-center justify-center min-h-screen">
           <h1 className="text-3xl font-bold text-accent mb-4">Submit Resources</h1>
           <p className="text-muted-text mb-8">Enter your game resources below.</p>
           {error && <p className="text-warning mb-4">{error}</p>}
           {success && <p className="text-accent mb-4">{success}</p>}
           <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
             <div>
               <label className="text-muted-text">Food</label>
               <input
                 type="number"
                 name="food"
                 value={formData.food}
                 onChange={handleChange}
                 className="w-full p-2 rounded bg-dark-secondary text-muted-text"
                 required
               />
             </div>
             <div>
               <label className="text-muted-text">Oil</label>
               <input
                 type="number"
                 name="oil"
                 value={formData.oil}
                 onChange={handleChange}
                 className="w-full p-2 rounded bg-dark-secondary text-muted-text"
                 required
               />
             </div>
             <div>
               <label className="text-muted-text">Steel</label>
               <input
                 type="number"
                 name="steel"
                 value={formData.steel}
                 onChange={handleChange}
                 className="w-full p-2 rounded bg-dark-secondary text-muted-text"
                 required
               />
             </div>
             <div>
               <label className="text-muted-text">Mineral</label>
               <input
                 type="number"
                 name="mineral"
                 value={formData.mineral}
                 onChange={handleChange}
                 className="w-full p-2 rounded bg-dark-secondary text-muted-text"
                 required
               />
             </div>
             <div>
               <label className="text-muted-text">Uranium</label>
               <input
                 type="number"
                 name="uranium"
                 value={formData.uranium}
                 onChange={handleChange}
                 className="w-full p-2 rounded bg-dark-secondary text-muted-text"
                 required
               />
             </div>
             <button
               type="submit"
               className="bg-accent text-dark-bg px-6 py-3 rounded-lg w-full hover:bg-warning"
             >
               Submit
             </button>
           </form>
         </div>
       );
     }