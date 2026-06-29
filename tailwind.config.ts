import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        academy: {
          red: "#B00020",
          gold: "#F4C430",
          dark: "#1A1A1A",
          gray: "#2D2D2D",
        },
      },
    },
  },
  plugins: [],
};
export default config;
