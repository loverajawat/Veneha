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
        olive: {
          50: "var(--color-olive-50)",
          100: "var(--color-olive-100)",
          400: "var(--color-olive-400)",
          500: "var(--color-olive-500)",
          600: "var(--color-olive-600)",
          700: "var(--color-olive-700)",
          800: "var(--color-olive-800)",
          900: "var(--color-olive-900)",
          950: "var(--color-olive-950)",
        },
        camo: {
          gold: "var(--color-gold)",
          maroon: "#800000",
          navy: "#002147",
        },
        surface: {
          DEFAULT: "var(--bg-surface)",
          elevated: "var(--bg-surface-elevated)",
        },
        brand: {
          text: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "var(--font-sans-fallback)", "sans-serif"],
        hindi: ["var(--font-hindi)", "var(--font-hindi-fallback)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
        heading: ["var(--font-serif)", "serif"],
        logo: ["var(--font-serif)", "serif"],
      }
    },
  },
  plugins: [],
};
export default config; 
