/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2563eb",
          green: "#16a34a",
          orange: "#ea580c",
          red: "#dc2626",
          purple: "#7c3aed",
          slate: "#0f172a"
        }
      }
    },
  },
  plugins: [],
}
