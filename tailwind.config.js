/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const treasureTheme = require("@treasure-project/tailwind-config");

const colors = treasureTheme.theme.extend.colors;

module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  presets: [require("@treasure-project/tailwind-config")],
  theme: {
    extend: {
      gridTemplateAreas: {
        "nft-modal": [
          "header header header header header",
          "misc misc misc selection selection",
          "nft nft nft selection selection",
          "nft nft nft selection selection",
          "nft nft nft selection selection",
        ],
      },
      colors: {
        border: "#282F3D",
        // input: "hsl(var(--input))",
        ring: colors.night[1000],
        background: colors.night[1200],
        foreground: "#ffffff",
        primary: {
          DEFAULT: colors.ruby[900],
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: colors.night[800],
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: colors.night[1200],
          foreground: colors.night[300],
        },
        accent: {
          DEFAULT: colors.night[900],
          foreground: colors.night[300],
        },
        popover: {
          DEFAULT: colors.night[1100],
          foreground: colors.night[400],
        },
        // card: {
        //   DEFAULT: "hsl(var(--card))",
        //   foreground: "hsl(var(--card-foreground))",
        // },
      },
      fontFamily: {
        sans: ["Whyte", ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.5s ease-out",
        "accordion-up": "accordion-up 0.5s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@savvywombat/tailwindcss-grid-areas"),
  ],
};
