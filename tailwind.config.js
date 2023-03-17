/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  presets: [require("@treasure-project/tailwind-config")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Whyte", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        steel: {
          50: "#D9D9D9",
          100: "#9FA3A9",
          700: "#19253A",
          800: "#131D2E",
          900: "#0D1420",
          1000: "#0C111B",
        }
      }
    },
  },
  plugins: [],
};
