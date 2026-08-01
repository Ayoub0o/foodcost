import type { Config } from "tailwindcss";

/**
 * Tailwind theme mapped to the Bringer 2 design tokens (see bringer/css/config.css)
 * so the app UI keeps brand continuity with the PixPlat marketing shell.
 */
const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "../../content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bringer 2 color scheme
        body: "#07090D",
        nav: "#07090D",
        container: "#1A1D24",
        heading: "#F5F7FA",
        // Slightly lighter than Bringer default for WCAG AA on #07090D (~5.2:1).
        text: "#D2D4DB",
        accent: {
          DEFAULT: "#3F6EE9",
          hover: "#3F6EE9",
          text: "#5C9DFF",
        },
        border: {
          DEFAULT: "#F5F7FA27",
          accent: "#5C9DFF80",
          mute: "#F5F7FA0D",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xs: "8px",
        sm: "16px",
        DEFAULT: "24px",
        lg: "32px",
        xl: "48px",
      },
      maxWidth: {
        container: "1200px",
      },
      spacing: {
        section: "128px",
      },
    },
  },
  plugins: [],
};

export default config;
