import * as Sentry from "@sentry/nextjs";
import type { Metadata } from "next";
import "../styles/globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
        <Sentry.ErrorBoundary
          fallback={
            <div className="container mx-auto p-4 text-center text-warning">
              <p>An unexpected error occurred. Please try again later.</p>
            </div>
          }
        >
          <Header />
          <main className="flex-grow container mx-auto p-4">{children}</main>
          <Footer />
        </Sentry.ErrorBoundary>
      </body>
    </html>
  );
}