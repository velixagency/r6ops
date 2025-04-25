// app/layout.tsx
import "../styles/globals.css";

export const metadata = {
  title: 'R6Ops - Age of Origins Dashboard',
  description: 'Track and optimize your Age of Origins gameplay with insights.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-900 text-white min-h-screen">
        <header className="w-full py-4 px-6 bg-zinc-800 shadow-md">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <a href="/" className="text-xl font-bold tracking-wide">
              R6Ops
            </a>
            <nav className="space-x-4">
              <a href="/" className="hover:underline">Dashboard</a>
              <a href="/login" className="hover:underline">Login</a>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
