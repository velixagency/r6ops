"use client";

import Error from "next/error";
import { useEffect } from "react";

export default function GlobalError({ error }) {
  useEffect(() => {
    console.error("Global error occurred:", error);
  }, [error]);

  return (
    <html>
      <body className="flex flex-col min-h-screen">
        <div className="container mx-auto p-4 text-center text-warning">
          <p>An unexpected error occurred. Please try again later.</p>
        </div>
      </body>
    </html>
  );
}