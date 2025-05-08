"use client";

import Link from "next/link";
import { useAuth } from "../lib/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex-grow bg-hero-image bg-cover bg-center bg-fixed">
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center text-center">
          <div className="absolute inset-0 bg-dark-panel opacity-70 backdrop-blur-10"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-bold text-accent-cyan mb-4">
              Level Up Faster with R6Ops
            </h1>
            <p className="text-xl md:text-2xl text-light-text mb-8">
              Your Age of Origins Companion
            </p>
            <div className="space-x-4">
              <Link
                href={user ? "/dashboard" : "/login"}
                className="inline-block bg-accent-cyan text-dark-bg font-semibold px-6 py-3 rounded-lg hover:bg-accent-green hover:text-dark-bg transition-colors shadow-cyan-glow"
              >
                Get Started
              </Link>
              <Link
                href="/signup"
                className="inline-block bg-accent-gold text-dark-bg font-semibold px-6 py-3 rounded-lg hover:bg-accent-cyan hover:text-dark-bg transition-colors shadow-cyan-glow"
              >
                Sign Up
              </Link>
              <Link
                href="/subscriptions"
                className="inline-block bg-accent-cyan text-dark-bg font-semibold px-6 py-3 rounded-lg hover:bg-accent-green hover:text-dark-bg transition-colors shadow-cyan-glow"
              >
                View Plans
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-accent-cyan mb-12 text-center">
              How R6Ops Helps You Dominate
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-accent-green mb-4">01</div>
                <h3 className="text-xl font-semibold text-light-text mb-3">Submit Your In-Game Data</h3>
                <p className="text-light-text">
                  Enter or upload your resources, speed-ups, city level, and stats to get started.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent-green mb-4">02</div>
                <h3 className="text-xl font-semibold text-light-text mb-3">AI Analyzes Your Stats</h3>
                <p className="text-light-text">
                  Our AI processes your data to create a tailored action plan for leveling up.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent-green mb-4">03</div>
                <h3 className="text-xl font-semibold text-light-text mb-3">Get Your Personalized Plan</h3>
                <p className="text-light-text">
                  Receive an action plan with troop formation recommendations to dominate the game.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-accent-cyan mb-12 text-center">
              Powerful Features to Elevate Your Gameplay
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-dark-panel backdrop-blur-10 p-6 rounded-lg border border-border-glow shadow-cyan-glow text-center">
                <h3 className="text-xl font-semibold text-accent-green mb-3">Comprehensive Data Collection</h3>
                <p className="text-light-text">
                  Submit all your in-game data, including resources, speed-ups, city level, and stats.
                </p>
              </div>
              <div className="bg-dark-panel backdrop-blur-10 p-6 rounded-lg border border-border-glow shadow-cyan-glow text-center">
                <h3 className="text-xl font-semibold text-accent-green mb-3">AI-Driven Action Plans</h3>
                <p className="text-light-text">
                  Get a personalized plan to level up faster and play more efficiently.
                </p>
              </div>
              <div className="bg-dark-panel backdrop-blur-10 p-6 rounded-lg border border-border-glow shadow-cyan-glow text-center">
                <h3 className="text-xl font-semibold text-accent-green mb-3">Troop Formation Recommendations</h3>
                <p className="text-light-text">
                  Optimize your battles with AI-recommended troop formations for your city level.
                </p>
              </div>
              <div className="bg-dark-panel backdrop-blur-10 p-6 rounded-lg border border-border-glow shadow-cyan-glow text-center">
                <h3 className="text-xl font-semibold text-accent-green mb-3">Screenshot Data Extraction</h3>
                <p className="text-light-text">
                  Upload screenshots to automatically extract in-game data, saving you time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-accent-cyan mb-12 text-center">
              Why R6Ops is Your Key to Success
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-accent-purple mb-3">Level Up Faster</h3>
                <p className="text-light-text">
                  Follow AI-driven action plans to upgrade your city and progress efficiently.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-accent-purple mb-3">Optimize Every Move</h3>
                <p className="text-light-text">
                  Use data-driven insights to make the best decisions for resources and speed-ups.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-accent-purple mb-3">Dominate with the Best Troops</h3>
                <p className="text-light-text">
                  Win battles with AI-recommended troop formations tailored to your stats.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-accent-cyan mb-12 text-center">
              What Players Are Saying
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-dark-panel backdrop-blur-10 p-6 rounded-lg border border-border-glow shadow-cyan-glow">
                <p className="text-light-text italic mb-4">
                  "R6Ops gave me an action plan that doubled my leveling speed. I love the troop recommendations!"
                </p>
                <p className="text-accent-green font-semibold">Alex T. - Casual Player</p>
              </div>
              <div className="bg-dark-panel backdrop-blur-10 p-6 rounded-lg border border-border-glow shadow-cyan-glow">
                <p className="text-light-text italic mb-4">
                  "The AI troop formations helped me win every battle. R6Ops is a must-have for competitive players."
                </p>
                <p className="text-accent-green font-semibold">Sarah K. - Competitive Player</p>
              </div>
              <div className="bg-dark-panel backdrop-blur-10 p-6 rounded-lg border border-border-glow shadow-cyan-glow">
                <p className="text-light-text italic mb-4">
                  "Our guild uses R6Ops to plan strategies. The action plans keep us ahead of the competition."
                </p>
                <p className="text-accent-green font-semibold">Mike R. - Guild Leader</p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Case Scenarios Section */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-accent-cyan mb-12 text-center">
              Excel in Every Age of Origins Scenario
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-dark-panel backdrop-blur-10 p-6 rounded-lg border border-border-glow shadow-cyan-glow">
                <h3 className="text-xl font-semibold text-accent-purple mb-3">Maximizing City Upgrades</h3>
                <p className="text-light-text">
                  Get an AI action plan to allocate resources and speed-ups for faster city upgrades.
                </p>
              </div>
              <div className="bg-dark-panel backdrop-blur-10 p-6 rounded-lg border border-border-glow shadow-cyan-glow">
                <h3 className="text-xl font-semibold text-accent-purple mb-3">Winning Battles with Optimal Troops</h3>
                <p className="text-light-text">
                  Use AI-recommended troop formations to dominate every battle at your city level.
                </p>
              </div>
              <div className="bg-dark-panel backdrop-blur-10 p-6 rounded-lg border border-border-glow shadow-cyan-glow">
                <h3 className="text-xl font-semibold text-accent-purple mb-3">Efficient Daily Gameplay</h3>
                <p className="text-light-text">
                  Optimize daily tasks with AI insights to progress faster and save time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold text-accent-cyan mb-2">5,000+</p>
                <p className="text-light-text">Age of Origins Players</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-accent-cyan mb-2">10M+</p>
                <p className="text-light-text">Resources Tracked Daily</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-accent-cyan mb-2">1,000+</p>
                <p className="text-light-text">Hours of Gameplay Saved</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-accent-cyan mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-accent-green mb-2">What is R6Ops?</h3>
                <p className="text-light-text">
                  R6Ops is an AI-powered platform for Age of Origins players, providing personalized action plans and troop formations based on your in-game data to help you level up and dominate.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-accent-green mb-2">What data do I need to submit?</h3>
                <p className="text-light-text">
                  Submit your resources, speed-ups, city level, player stats, and troop levels. The more data you provide, the better your AI-generated action plan will be.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-accent-green mb-2">How does R6Ops generate action plans?</h3>
                <p className="text-light-text">
                  Our AI analyzes your submitted data (resources, stats, city level, etc.) to create a tailored plan for leveling up, optimizing gameplay, and recommending the best troop formations.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-accent-green mb-2">Is R6Ops free to use?</h3>
                <p className="text-light-text">
                  R6Ops offers both free and premium plans. Check out our{" "}
                  <Link href="/subscriptions" className="text-accent-cyan hover:underline">
                    subscription plans
                  </Link>{" "}
                  to learn more.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-accent-green mb-2">Can I use R6Ops on mobile?</h3>
                <p className="text-light-text">
                  Absolutely! R6Ops is fully responsive and works seamlessly on both desktop and mobile devices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-16 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-accent-cyan mb-4">
              Start Dominating Age of Origins with AI-Powered Insights Today!
            </h2>
            <p className="text-lg md:text-xl text-light-text mb-8">
              Join now and get your personalized action plan.
            </p>
            <Link
              href={user ? "/dashboard" : "/login"}
              className="inline-block bg-accent-cyan text-dark-bg font-semibold px-8 py-4 rounded-lg hover:bg-accent-green hover:text-dark-bg transition-colors shadow-cyan-glow text-lg"
            >
              {user ? "Go to Dashboard" : "Sign Up Now"}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}