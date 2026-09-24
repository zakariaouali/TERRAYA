import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.5rem", lg: "2rem", xl: "3rem" },
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        sand: {
          50: "#FBF8F4",
          100: "#F5F1EC",
          200: "#E8DDD1",
          300: "#D6C2AA",
          400: "#C8B29A",
          500: "#B08B68",
          600: "#8D6E56",
          700: "#6B5240",
          800: "#4A382C",
          900: "#3A2E26",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "serif"],
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui"],
      },
      letterSpacing: {
        luxury: "0.22em",
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85'/%3E%3CfeColorMatrix values='0 0 0 0 0.55 0 0 0 0 0.43 0 0 0 0 0.34 0 0 0 0.18 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "page-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) both",
        "page-in": "page-in 0.35s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
