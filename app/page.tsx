"use client";

import Link from "next/link";
import { useAuth } from "../lib/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Welcome to R6Ops</h1>
      <p className="mb-4">Track, optimize, and dominate in Age of Origins.</p>
      {user ? (
        <p>
          You’re logged in as {user.email}. Go to your{" "}
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            Dashboard
          </Link>{" "}
          or{" "}
          <Link href="/submit" className="text-blue-500 hover:underline">
            Submit Resources
          </Link>.
        </p>
      ) : (
        <p>
          Please{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            log in
          </Link>{" "}
          to access your dashboard and submit resources.
        </p>
      )}
    </div>
  );
}