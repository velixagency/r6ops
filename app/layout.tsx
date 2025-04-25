import '../styles/globals.css';
import Header from "../components/Header";

export const metadata = {
  title: "R6Ops",
  description: "Track and optimize your Age of Origins strategy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-white font-sans min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-4 pt-20">{children}</main>
      </body>
    </html>
  );
}