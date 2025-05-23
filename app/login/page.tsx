"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import { UserRole } from "../../lib/types";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);

      // Update user metadata to set role as admin (temporary for this user)
      if (email === "info@velixagency.com") {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { role: "admin" as UserRole },
        });
        if (updateError) throw new Error(`Failed to update metadata: ${updateError.message}`);
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-dark-bg p-8 rounded-lg shadow-metallic-glow">
        <h1 className="text-3xl font-bold text-accent-cyan mb-6 text-center">Log In to R6ops</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-light-text font-medium mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-border-metallic bg-dark-bg text-light-text rounded focus:outline-none focus:ring-2 focus:ring-accent-gold"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-light-text font-medium mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-border-metallic bg-dark-bg text-light-text rounded focus:outline-none focus:ring-2 focus:ring-accent-gold"
              placeholder="Enter your password"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-accent-cyan text-dark-bg font-semibold py-3 rounded hover:bg-accent-gold transition-colors"
          >
            Log In
          </button>
        </form>
        <p className="text-light-text text-sm mt-4 text-center">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-accent-cyan hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}