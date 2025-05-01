"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";

export default function Login() {
  const router = useRouter();
  const { user, loading, signInWithGoogle, signInWithFacebook } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("Login page - Loading state:", loading);
    console.log("Login page - User state:", user);
    if (user && !loading) {
      console.log("User authenticated, redirecting to dashboard:", user);
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Initiating Google sign-in with popup...");
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      setError(`Google login failed: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Initiating Facebook sign-in with popup...");
      await signInWithFacebook();
    } catch (error: any) {
      console.error("Facebook sign-in error:", error);
      setError(`Facebook login failed: ${error.message}`);
      setIsLoading(false);
    }
  };

  // If loading is true, show loading message
  if (loading) {
    return <div className="text-light-text text-lg">Loading...</div>;
  }

  // If user is already authenticated, show redirecting message
  if (user) {
    return <div className="text-light-text text-lg">Redirecting to dashboard...</div>;
  }

  // Default render: show login form
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-dark-panel backdrop-blur-10 p-8 rounded-lg border border-border-glow shadow-cyan-glow">
        <h1 className="text-3xl font-bold text-accent-cyan mb-4 text-center">Login to R6Ops</h1>
        <p className="text-light-text mb-8 text-center">
          Sign in with Google, Facebook, or Game Center
        </p>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {isLoading && <p className="text-light-text mb-4 text-center">Logging in...</p>}
        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="bg-accent-cyan text-dark-bg font-semibold px-6 py-3 rounded-lg w-full hover:bg-accent-green hover:text-dark-bg transition-colors shadow-cyan-glow disabled:opacity-50"
            disabled={isLoading}
          >
            Sign in with Google
          </button>
          <button
            onClick={handleFacebookSignIn}
            className="bg-accent-cyan text-dark-bg font-semibold px-6 py-3 rounded-lg w-full hover:bg-accent-green hover:text-dark-bg transition-colors shadow-cyan-glow disabled:opacity-50"
            disabled={isLoading}
          >
            Sign in with Facebook
          </button>
          <button
            className="bg-accent-cyan text-dark-bg font-semibold px-6 py-3 rounded-lg w-full opacity-50 cursor-not-allowed"
            disabled
          >
            Sign in with Game Center (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}