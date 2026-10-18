// const plugin = require('tailwindcss/plugin');
/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  // content: ["./src/app/**/*.{js,jsx,ts,tsx}"],
  // presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        display: "Fraunces_600SemiBold",
        bengali: "NotoSansBengali_500Medium",
        body: "AvenirLTProBook",
        AvenirLTProBlack: "AvenirLTProBlack",
        AvenirLTProBlackOblique: "AvenirLTProBlackOblique",
        AvenirLTProBook: "AvenirLTProBook",
        AvenirLTProBookOblique: "AvenirLTProBookOblique",
        AvenirLTProHeavy: "AvenirLTProHeavy",
        AvenirLTProHeavyOblique: "AvenirLTProHeavyOblique",
        AvenirLTProLight: "AvenirLTProLight",
        AvenirLTProMedium: "AvenirLTProMedium",
        AvenirLTProMediumOblique: "AvenirLTProMediumOblique",
        AvenirLTProOblique: "AvenirLTProOblique",
        AvenirLTProRoman: "AvenirLTProRoman",
      },

      colors: {
        primary: "#F36C26",
        primaryDark: "#D84E16",
        background: "#FFF5E8",
        text: "#3A2E2A",
        textMuted: "rgba(58,46,42,0.60)",
        textFaint: "rgba(58,46,42,0.40)",
        border: "rgba(58,46,42,0.10)",
        borderStrong: "rgba(58,46,42,0.15)",
        card: "#FFFFFF",
        ink: "#3A2E2A",
        white: "#FFFFFF",
        success: "#4CAF50",
        emerald: { bg: "#ECFDF5", text: "#047857" },
        amber: { bg: "#FFFBEB", text: "#B45309" },
        red: { bg: "#FEF2F2", text: "#DC2626" },
        star: "#FBBF24",
        starEmpty: "#FCD34D",
      },
    },
  },
  plugins: [],
}
