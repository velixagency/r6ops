"use client";

import Link from "next/link";
import { useAuth } from "../lib/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-800 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          R6Ops
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/submit">Submit Resources</Link>
          <Link href="/dashboard">Dashboard</Link>
          {user ? (
            <>
              <span className="text-sm">Welcome, {user.email}</span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="text-sm text-white hover:underline">
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}