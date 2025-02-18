import type { Config } from "tailwindcss"

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          dark: "rgb(var(--background-dark) / <alpha-value>)",
          DEFAULT: "rgb(var(--background) / <alpha-value>)",
          light: "rgb(var(--background-light) / <alpha-value>)",
        },
        foreground: {
          dark: "rgb(var(--foreground-dark) / <alpha-value>)",
          DEFAULT: "rgb(var(--foreground) / <alpha-value>)",
          light: "rgb(var(--foreground-light) / <alpha-value>)",
        },
      },
      borderOpacity: ({ theme }) => theme("opacity"),
    },
  },
  plugins: [],
} satisfies Config
