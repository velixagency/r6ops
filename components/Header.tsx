export default function Header() {
    return (
      <header className="fixed top-0 left-0 w-full bg-card border-b border-zinc-800 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold tracking-tight">R6Ops</a>
          <nav className="space-x-6 text-muted">
            <a href="/dashboard" className="hover:text-white transition">Dashboard</a>
            <a href="/submit" className="hover:text-white transition">Submit</a>
            <a href="/login" className="hover:text-white transition">Login</a>
          </nav>
        </div>
      </header>
    );
  }