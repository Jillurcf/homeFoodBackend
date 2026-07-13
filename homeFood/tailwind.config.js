// const plugin = require('tailwindcss/plugin');
/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  // content: ["./src/app/**/*.{js,jsx,ts,tsx}"],
  // presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        AvenirLTProBlack: 'AvenirLTProBlack',
        AvenirLTProBlackOblique: 'AvenirLTProBlackOblique',
        AvenirLTProBook: 'AvenirLTProBook',
        AvenirLTProBookOblique: 'AvenirLTProBookOblique',
        AvenirLTProHeavy: 'AvenirLTProHeavy',
        AvenirLTProHeavyOblique: 'AvenirLTProHeavyOblique',
        AvenirLTProLight: 'AvenirLTProLight',
        AvenirLTProMedium: 'AvenirLTProMedium',
        AvenirLTProMediumOblique: 'AvenirLTProMediumOblique',
        AvenirLTProOblique: 'AvenirLTProOblique',
        AvenirLTProRoman: 'AvenirLTProRoman'
      },

      colors: {
        primary: '#F36C26',
        PrimaryFocus: "#FFFFFF33",
        whiteBtnText: "#141316",
        title: '#272727',
        backgroundColor: '#000000',
        subT: '#5e5e5e',
        offWhite: '#E6ECEC',
        secondary: '#F4FAFA',
        white100: '#EFEFEF',
        border: '#DFDFDF',
        primary100: '#EEF6F6',
        primary200: '#9BB3B5',
        danger: '#CE3535',
      },
    },
  },
  plugins: [],
}