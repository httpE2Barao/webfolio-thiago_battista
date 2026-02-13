import plugin from "tailwindcss/plugin";

const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        backgroundHeader: "var(--background-header)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".text-responsive": {
          "@apply text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold capitalize text-white leading-tight": {},
        },
      });
    }),
  ],
};
export default config;
