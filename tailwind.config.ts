/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark-bg": "#1C2526",
        "dark-panel": "rgba(46, 55, 56, 0.8)",
        "light-text": "#D1D5DB",
        "accent-cyan": "#00FFFF",
        "accent-green": "#00FF99",
        "accent-purple": "#C084FC",
        "border-glow": "rgba(0, 255, 255, 0.3)",
      },
      fontFamily: {
        neue: [
          "neue-haas-grotesk-display",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "NotoColorEmoji",
          "Segoe UI Symbol",
          "Android Emoji",
          "EmojiSymbols",
        ],
      },
      boxShadow: {
        "cyan-glow": "0 0 10px rgba(0, 255, 255, 0)",
      },
      backgroundImage: {
        "hero-image": "url('/images/hero-bg-1.jpg')",
      },
      backdropFilter: {
        "blur-10": "blur(10px)",
        "brightness-110": "brightness(1.1)",
        "saturate-120": "saturate(1.2)",
      },
    },
  },
  plugins: [
    require("tailwindcss-filters"),
  ],
}