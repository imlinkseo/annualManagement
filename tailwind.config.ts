import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-pretendard)", "sans-serif"],
      },
      screens: {
        xxs: "376px",
      },
    },
  },
  plugins: [],
};
export default config;
