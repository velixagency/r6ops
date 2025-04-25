export default function Home() {
  return (
    <section className="space-y-16">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Track. Optimize. Dominate.</h1>
        <p className="text-muted text-lg max-w-xl mx-auto mb-6">
          R6Ops gives Age of Origins players powerful tools to track resources, optimize fleets, and win more events.
        </p>
        <a href="/login" className="inline-block bg-accent text-black px-6 py-3 rounded font-semibold hover:brightness-90 transition">
          Get Started
        </a>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl p-6 shadow hover:shadow-lg transition">
          <h3 className="text-xl font-bold mb-2">Resource Tracking</h3>
          <p className="text-muted">Keep tabs on food, oil, steel, minerals, and uranium in real-time.</p>
        </div>
        <div className="bg-card rounded-xl p-6 shadow hover:shadow-lg transition">
          <h3 className="text-xl font-bold mb-2">Insight Engine</h3>
          <p className="text-muted">Get dynamic tips like “Upgrade farm production” based on current game state.</p>
        </div>
        <div className="bg-card rounded-xl p-6 shadow hover:shadow-lg transition">
          <h3 className="text-xl font-bold mb-2">Fleet Optimizer</h3>
          <p className="text-muted">Know the best attack formations based on your troop levels and events.</p>
        </div>
      </div>
    </section>
  );
}