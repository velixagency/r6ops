"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider, facebookProvider } from "../../lib/firebase";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    console.log("Checking auth state...");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User authenticated:", user);
        router.push("/dashboard");
      } else {
        console.log("No user authenticated.");
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      console.log("Initiating Google sign-in with popup...");
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        console.log("Popup login successful:", result.user);
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      setError(`Google login failed: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setIsLoading(true);
      console.log("Initiating Facebook sign-in with popup...");
      const result = await signInWithPopup(auth, facebookProvider);
      if (result.user) {
        console.log("Popup login successful:", result.user);
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Facebook sign-in error:", error);
      setError(`Facebook login failed: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold text-accent mb-4">Login to R6Ops</h1>
      <p className="text-muted-text mb-8">
        Sign in with Google, Facebook, or Game Center
      </p>
      {error && <p className="text-warning mb-4">{error}</p>}
      {isLoading && <p className="text-muted-text mb-4">Logging in...</p>}
      <div className="space-y-4">
        <button
          onClick={handleGoogleSignIn}
          className="bg-accent text-dark-bg px-6 py-3 rounded-lg w-full hover:bg-warning disabled:opacity-50"
          disabled={isLoading}
        >
          Sign in with Google
        </button>
        <button
          onClick={handleFacebookSignIn}
          className="bg-accent text-dark-bg px-6 py-3 rounded-lg w-full hover:bg-warning disabled:opacity-50"
          disabled={isLoading}
        >
          Sign in with Facebook
        </button>
        <button
          className="bg-accent text-dark-bg px-6 py-3 rounded-lg w-full hover:bg-warning opacity-50"
          disabled
        >
          Sign in with Game Center (Coming Soon)
        </button>
      </div>
    </div>
  );
}