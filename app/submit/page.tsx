"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import * as Sentry from "@sentry/nextjs";

export default function Submit() {
  const router = useRouter();
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    food: 0,
    oil: 0,
    steel: 0,
    mineral: 0,
    uranium: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Sentry initialized:", Sentry.isInitialized());
    console.log("Checking auth state...");
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        console.log("User authenticated:", currentUser);
        setUser(currentUser);
        // Test Sentry error
        throw new Error("Test Sentry client error");
      } else {
        console.log("No user authenticated.");
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
          .then((result) => {
            console.log("Popup login successful:", result.user);
            setUser(result.user);
          })
          .catch((error) => {
            console.error("Popup login failed:", error);
          });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && loading) {
      console.log("Fetching resources for user_id:", user.uid);
      const fetchResources = async () => {
        try {
          const response = await fetch(`/api/get-resources?user_id=${user.uid}`);
          const result = await response.json();
          console.log("Raw API response:", result);
          setLoading(false);
          if (!response.ok) {
            console.error("API error:", result);
            return;
          }
          if (result.data) {
            console.log("API response:", { data: result.data });
            setFormData({
              food: result.data.food || 0,
              oil: result.data.oil || 0,
              steel: result.data.steel || 0,
              mineral: result.data.mineral || 0,
              uranium: result.data.uranium || 0,
            });
          } else {
            console.log("No resources found for user_id:", user.uid);
          }
        } catch (error) {
          console.error("Fetch error:", error);
          setLoading(false);
        }
      };
      fetchResources();
    }
  }, [user, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
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
          troop_levels: {},
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error("Submit error:", result);
        return;
      }
      router.push("/dashboard");
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Submit Resources</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="food" className="block">Food</label>
          <input
            type="number"
            id="food"
            name="food"
            value={formData.food}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label htmlFor="oil" className="block">Oil</label>
          <input
            type="number"
            id="oil"
            name="oil"
            value={formData.oil}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label htmlFor="steel" className="block">Steel</label>
          <input
            type="number"
            id="steel"
            name="steel"
            value={formData.steel}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label htmlFor="mineral" className="block">Mineral</label>
          <input
            type="number"
            id="mineral"
            name="mineral"
            value={formData.mineral}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label htmlFor="uranium" className="block">Uranium</label>
          <input
            type="number"
            id="uranium"
            name="uranium"
            value={formData.uranium}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <button type="submit" className="bg-accent text-white p-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
}