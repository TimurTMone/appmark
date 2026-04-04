import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Display", "Inter", "sans-serif"],
      },
      colors: {
        ink: "#0a0a0a",
        accent: "#00ffa3",
      },
    },
  },
  plugins: [],
};
export default config;
