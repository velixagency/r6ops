"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider, facebookProvider } from "../../lib/firebase";
import { signInWithRedirect, getRedirectResult } from "firebase/auth";

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        router.push("/dashboard");
      }
    });
  }, [router]);

  const handleGoogleSignIn = () => {
    signInWithRedirect(auth, googleProvider);
  };

  const handleFacebookSignIn = () => {
    signInWithRedirect(auth, facebookProvider);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold text-accent mb-4">Login to R6Ops</h1>
      <p className="text-muted-text mb-8">
        Sign in with Google, Facebook, or Game Center
      </p>
      <div className="space-y-4">
        <button
          onClick={handleGoogleSignIn}
          className="bg-accent text-dark-bg px-6 py-3 rounded-lg w-full hover:bg-warning"
        >
          Sign in with Google
        </button>
        <button
          onClick={handleFacebookSignIn}
          className="bg-accent text-dark-bg px-6 py-3 rounded-lg w-full hover:bg-warning"
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