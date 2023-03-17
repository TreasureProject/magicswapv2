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
        night: {
          1000: "#0B111B",
        }
      }
    },
  },
  plugins: [],
};
