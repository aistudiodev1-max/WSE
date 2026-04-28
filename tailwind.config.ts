import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Libre+Baskerville", "serif"],
        display: ["Playfair Display", "serif"],
      },
      colors: {
        brand: {
          orange: "#f5a623",
          dark: "#121212",
          sepia: "#fdf6e3",
          teal: "#a3e4d7",
        },
      },
    },
  },
  plugins: [],
};
export default config;
