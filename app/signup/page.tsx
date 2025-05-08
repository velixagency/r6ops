"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import { UserRole } from "../../lib/types";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: "user" as UserRole, // Default role for new users
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Ensure user metadata is updated
      if (data.user) {
        await supabase.auth.updateUser({
          data: { role: "user" as UserRole },
        });
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-dark-bg p-8 rounded-lg shadow-metallic-glow">
        <h1 className="text-3xl font-bold text-accent-cyan mb-6 text-center">Sign Up for R6ops</h1>
        <form onSubmit={handleSignUp} className="space-y-6">
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
          {success && (
            <p className="text-accent-green text-sm">Account created successfully! Redirecting to login...</p>
          )}
          <button
            type="submit"
            className="w-full bg-accent-cyan text-dark-bg font-semibold py-3 rounded hover:bg-accent-gold transition-colors"
          >
            Sign Up
          </button>
        </form>
        <p className="text-light-text text-sm mt-4 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-cyan hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}