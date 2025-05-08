"use client";

import Link from "next/link";

export default function Subscriptions() {
  return (
    <div className="min-h-screen p-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-accent-cyan mb-8 text-center">Subscription Plans</h1>
        <p className="text-light-text text-lg text-center mb-12">
          Choose the plan that best suits your needs to get the most out of AOZ Analytics.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Single Player Plan */}
          <div className="bg-dark-bg p-6 rounded-lg shadow-metallic-glow border border-border-metallic">
            <h2 className="text-2xl font-semibold text-accent-cyan mb-4">Single Player Plan</h2>
            <p className="text-light-text mb-4">
              Perfect for individual players looking to track and analyze their in-game data.
            </p>
            <p className="text-3xl font-bold text-accent-gold mb-6">$10/month</p>
            <ul className="text-light-text space-y-2 mb-6">
              <li>✔ Submit and track in-game data</li>
              <li>✔ Access to single-player dashboard</li>
              <li>✔ Basic analytics and insights</li>
            </ul>
            <Link
              href="/signup"
              className="block text-center bg-accent-cyan text-dark-bg font-semibold py-3 rounded hover:bg-accent-gold transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Alliance Management Plan */}
          <div className="bg-dark-bg p-6 rounded-lg shadow-metallic-glow border border-border-metallic">
            <h2 className="text-2xl font-semibold text-accent-cyan mb-4">Alliance Management Plan</h2>
            <p className="text-light-text mb-4">
              Ideal for alliance leaders to manage and analyze data for the entire team.
            </p>
            <p className="text-3xl font-bold text-accent-gold mb-6">$50/month</p>
            <ul className="text-light-text space-y-2 mb-6">
              <li>✔ All Single Player Plan features</li>
              <li>✔ Alliance-wide data tracking</li>
              <li>✔ Advanced analytics for alliance performance</li>
              <li>✔ Priority support</li>
            </ul>
            <Link
              href="/signup"
              className="block text-center bg-accent-cyan text-dark-bg font-semibold py-3 rounded hover:bg-accent-gold transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
        <p className="text-light-text text-center mt-12">
          Already a member?{" "}
          <Link href="/login" className="text-accent-cyan hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}