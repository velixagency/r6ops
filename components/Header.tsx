"use client";

import Link from "next/link";
import { useAuth } from "../lib/AuthContext";
import { FaTachometerAlt, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="backdrop-blur-10 backdrop-brightness-110 backdrop-saturate-120 header-border fixed w-full top-0 z-50">
      <nav className="mx-auto p-1 flex justify-between items-center min-h-[40px] px-[100px]">
        <Link href="/" className="text-[16px] font-bold text-white">
          R6ops
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-light-text hover:text-accent-cyan transition-colors">
            <FaTachometerAlt size={24} />
          </Link>
          {user ? (
            <>
              <button
                onClick={logout}
                className="text-light-text hover:text-accent-cyan transition-colors"
              >
                <FaSignOutAlt size={24} />
              </button>
            </>
          ) : (
            <Link href="/login" className="text-light-text hover:text-accent-cyan transition-colors">
              <FaSignInAlt size={24} />
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}