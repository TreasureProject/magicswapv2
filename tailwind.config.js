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
        "treasure-red": {
          100: "#FCE9E9",
          200: "#F8D4D4",
          300: "#F5BEBE",
          400: "#F1A8A8",
          500: "#EE9393",
          600: "#EA7D7D",
          700: "#E76767",
          800: "#E03C3C",
          900: "#DC2626",
          1000: "#C62222",
          1100: "#841717",
        },
        "honey-gold": {
          25: "#FFFDF7",
          50: "#FFFAEF",
          100: "#FEF5DF",
          200: "#FEF0D0",
          300: "#FDEBC0",
          400: "#FDE7B0",
          500: "#FCE2A0",
          600: "#FCDD90",
          700: "#FBD881",
          800: "#FBD371",
          900: "#FACE61",
        },
        "sapphire-blue": {
          100: "#E6EFF4",
          200: "#CCDFEA",
          300: "#99BFD5",
          400: "#669FBF",
          500: "#4D8FB5",
          600: "#337FAA",
          700: "#005F95",
          800: "#004C77",
          900: "#004368",
          1000: "#00304B",
          1100: "#00263C",
        },
        base: {
          100: "#E7E8E9",
          200: "#CFD1D4",
          300: "#B7BABE",
          400: "#9FA3A9",
          500: "#888C93",
          600: "#70747D",
          700: "#404652",
          800: "#1F2D45",
          900: "#19253A",
          1000: "#172135",
          1100: "#131D2E",
          1200: "#0D1420",
        },
        succes: {
          100: "#A0F0A0",
          200: "#4FC74F",
          300: "#5FBC17",
          400: "#245134",
          500: "#162A2B",
        },
        warning: {
          100: "#FFD697",
          200: "#FABC5F",
          300: "#F0AA40",
          400: "#D68A18",
          500: "#594320",
        },
        glass: {
          ruby: "#DC262610",
          warning: "#D68A1810",
          success: "#4FC74F10",
          base: "#40465225",
          sapphire: "#337FAA10",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
