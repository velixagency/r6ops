import type { Metadata } from "next";
import "../styles/globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AuthProvider } from "../lib/AuthContext"; // Import AuthProvider

export const metadata: Metadata = {
  title: "R6Ops - Track, Optimize, Dominate",
  description: "Resource tracker and optimizer for Age of Origins players.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <Header />
          <main className="flex-grow container mx-auto p-4">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}