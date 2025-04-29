import type { Metadata } from "next";
import "../styles/globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AuthProvider } from "../lib/AuthContext";

export const metadata: Metadata = {
  title: "R6Ops - Age of Origins Resource Tracker & Optimizer",
  description: "Track, optimize, and dominate in Age of Origins with R6Ops. Manage resources, speed-ups, and player stats effortlessly to gain a competitive edge.",
  keywords: "Age of Origins resource tracker, optimize Age of Origins gameplay, R6Ops, game resource management tool, Age of Origins speed-ups",
  openGraph: {
    title: "R6Ops - Age of Origins Resource Tracker & Optimizer",
    description: "Track, optimize, and dominate in Age of Origins with R6Ops. Manage resources, speed-ups, and player stats effortlessly to gain a competitive edge.",
    url: "https://r6ops.com", // Replace with your actual domain
    type: "website",
    images: [
      {
        url: "/images/hero-bg-1.jpg", // Replace with a relevant image URL
        width: 1200,
        height: 630,
        alt: "R6Ops Hero Background",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/trc2lsw.css" />
      </head>
      <body className="flex flex-col min-h-screen font-neue">
        <AuthProvider>
          <Header />
          <div className="flex-grow bg-hero-image bg-cover bg-center bg-fixed">
            <main className="flex-grow">{children}</main>
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}