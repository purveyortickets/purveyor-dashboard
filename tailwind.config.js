/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
        success: "#22c55e",
        danger: "#ef4444",
        background: "#111827",
        card: "#1f2937",
        border: "#374151",
      },
    },
  },
  plugins: [],
};