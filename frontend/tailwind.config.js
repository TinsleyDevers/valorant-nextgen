module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        rajdhani: ['"Rajdhani"', "sans-serif"],
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
