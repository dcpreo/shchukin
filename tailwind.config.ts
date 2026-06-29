import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,md,mdx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Restrained museum / archive palette
        ivory: "#F7F3EA", // warm white background
        paper: "#FCFAF4", // raised card surface
        ink: "#1B1715", // near-black typography
        muted: "#6B6258", // secondary text
        line: "#E3DCCD", // quiet dividers
        oxblood: {
          DEFAULT: "#6A1B23", // deep burgundy / oxblood accent
          dark: "#4E141A",
          soft: "#8A3C43"
        },
        brass: "#9A7B4F" // catalogue-number / footnote tone
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      maxWidth: {
        prose: "68ch",
        archive: "1180px"
      },
      letterSpacing: {
        label: "0.14em"
      }
    }
  },
  plugins: []
};

export default config;
