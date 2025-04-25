import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-dark-secondary p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-accent">
          R6Ops
        </Link>
        <nav className="space-x-4">
          <Link href="/dashboard" className="hover:text-accent">
            Dashboard
          </Link>
          <Link href="/submit" className="hover:text-accent">
            Submit Data
          </Link>
          <Link href="/login" className="hover:text-accent">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}