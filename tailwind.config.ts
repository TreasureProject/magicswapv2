// @ts-nocheck
import baseConfig from "@treasure-dev/tailwind-config";
import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const colors = baseConfig.theme.extend.colors;

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  presets: [baseConfig],
  theme: {
    extend: {
      spacing: {
        "8xl": "88rem",
      },
      gridTemplateAreas: {
        "nft-modal": [
          "header header header header header",
          "misc misc misc misc selection",
          "nft nft nft nft selection",
          "nft nft nft nft selection",
          "nft nft nft nft selection",
        ],
        "nft-modal-viewonly": [
          "header header header header header",
          "misc misc misc misc misc",
          "nft nft nft nft nft",
          "nft nft nft nft nft",
          "nft nft nft nft nft",
        ],
        "nft-modal-mobile": [
          "header header header header header",
          "misc misc misc misc misc",
          "nft nft nft nft nft",
          "nft nft nft nft nft",
          "selection selection selection selection selection",
        ],
      },
      boxShadow: {
        glow: "0px 0px 120px rgba(31, 45, 69, 0.5)",
      },
      colors: {
        border: "#282F3D",
        // input: "hsl(var(--input))",
        ring: colors.night[600],
        background: colors.night[1000],
        backgroundImage: {
          "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        },
        foreground: "#ffffff",
        primary: {
          DEFAULT: colors.ruby[600],
          foreground: "#ffffff",
        },
        input: "#404652",
        secondary: {
          DEFAULT: colors.night[400],
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: colors.night[1000],
          foreground: colors.silver[300],
        },
        accent: {
          DEFAULT: colors.night[500],
          foreground: colors.silver[300],
        },
        popover: {
          DEFAULT: colors.night[700],
          foreground: colors.silver[400],
        },
        // card: {
        //   DEFAULT: "hsl(var(--card))",
        //   foreground: "hsl(var(--card-foreground))",
        // },
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
        "rotate-45": {
          "100%": {
            transform: "rotate(180deg)",
          },
        },
        "toast-enter": {
          "0%": { transform: "scale(0.9)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        "toast-leave": {
          "0%": { transform: "scale(1)", opacity: 1 },
          "100%": { transform: "scale(0.9)", opacity: 0 },
        },
      },
      animation: {
        "toast-enter": "toast-enter 200ms ease-out",
        "toast-leave": "toast-leave 150ms ease-in forwards",
        "accordion-down": "accordion-down 0.5s ease-out",
        "accordion-up": "accordion-up 0.5s ease-out",
        "rotate-45": "rotate-45 0.5s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@savvywombat/tailwindcss-grid-areas"),
    require("tailwind-scrollbar")({ nocompatible: true }),
  ],
} satisfies Config;
