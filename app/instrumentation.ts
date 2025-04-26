import * as Sentry from "@sentry/nextjs";

export async function register() {
  console.log("Instrumentation file loaded");
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("Initializing Sentry for nodejs");
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      enableTracing: true,
    });
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    console.log("Initializing Sentry for edge");
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
      enableTracing: true,
    });
  }
}