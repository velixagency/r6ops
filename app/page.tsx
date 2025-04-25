import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-5xl font-bold text-accent mb-4">
        Track. Optimize. Dominate.
      </h1>
      <p className="text-xl text-muted-text mb-8">
        Your ultimate Age of Origins resource tracker and optimizer.
      </p>
      <Link
        href="/login"
        className="bg-accent text-dark-bg px-6 py-3 rounded-lg font-semibold hover:bg-warning"
      >
        Get Started
      </Link>
    </div>
  );
}