const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: "velix-agency", // Replace with your Sentry organization slug
    project: "r6ops", // Your Sentry project name
  },
  {
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
  }
);