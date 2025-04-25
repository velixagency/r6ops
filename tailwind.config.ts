/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark-bg": "#0f172a",
        "dark-secondary": "#1e293b",
        accent: "#22d3ee",
        "muted-text": "#94a3b8",
        warning: "#facc15",
      },
    },
  },
  plugins: [],
};