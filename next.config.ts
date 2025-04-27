/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Increase the body size limit to 10 MB
    },
  },
};

module.exports = nextConfig;