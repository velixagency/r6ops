"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { auth } from "../../lib/firebase";

export default function Submit() {
  const [formData, setFormData] = useState({
    food: "",
    oil: "",
    steel: "",
    mineral: "",
    uranium: "",
    troop_levels: "",
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("resources").insert({
      user_id: user.uid,
      food: parseInt(formData.food),
      oil: parseInt(formData.oil),
      steel: parseInt(formData.steel),
      mineral: parseInt(formData.mineral),
      uranium: parseInt(formData.uranium),
      troop_levels: formData.troop_levels ? JSON.parse(formData.troop_levels) : null,
    });

    if (error) {
      console.error("Error submitting data:", error);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-accent mb-4">Submit Game Data</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label htmlFor="food" className="block text-muted-text">
            Food
          </label>
          <input
            type="number"
            id="food"
            value={formData.food}
            onChange={handleChange}
            className="w-full p-2 bg-dark-secondary text-muted-text rounded"
            placeholder="Enter food amount"
            required
          />
        </div>
        <div>
          <label htmlFor="oil" className="block text-muted-text">
            Oil
          </label>
          <input
            type="number"
            id="oil"
            value={formData.oil}
            onChange={handleChange}
            className="w-full p-2 bg-dark-secondary text-muted-text rounded"
            placeholder="Enter oil amount"
            required
          />
        </div>
        <div>
          <label htmlFor="steel" className="block text-muted-text">
            Steel
          </label>
          <input
            type="number"
            id="steel"
            value={formData.steel}
            onChange={handleChange}
            className="w-full p-2 bg-dark-secondary text-muted-text rounded"
            placeholder="Enter steel amount"
            required
          />
        </div>
        <div>
          <label htmlFor="mineral" className="block text-muted-text">
            Mineral
          </label>
          <input
            type="number"
            id="mineral"
            value={formData.mineral}
            onChange={handleChange}
            className="w-full p-2 bg-dark-secondary text-muted-text rounded"
            placeholder="Enter mineral amount"
            required
          />
        </div>
        <div>
          <label htmlFor="uranium" className="block text-muted-text">
            Uranium
          </label>
          <input
            type="number"
            id="uranium"
            value={formData.uranium}
            onChange={handleChange}
            className="w-full p-2 bg-dark-secondary text-muted-text rounded"
            placeholder="Enter uranium amount"
            required
          />
        </div>
        <div>
          <label htmlFor="troop_levels" className="block text-muted-text">
            Troop Levels (JSON)
          </label>
          <input
            type="text"
            id="troop_levels"
            value={formData.troop_levels}
            onChange={handleChange}
            className="w-full p-2 bg-dark-secondary text-muted-text rounded"
            placeholder='e.g., {"infantry": 100, "tanks": 50}'
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