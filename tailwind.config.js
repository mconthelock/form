/** @type {import('tailwindcss').Config} */

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

module.exports = {
  mode: "jit",
  content: [
    "./application/views/**/*.php",
    "./assets/script/**/*.js",
    "./assets/style/*.css",
  ],
//   theme: {
//     extend: {
//       fontFamily: {
//         sans: [
//           "LINE Seed EN",
//           "LINE Seed EN Bold",
//           "LINE Seed TH",
//           "LINE Seed TH Bold",
//           "LINE Seed JP",
//           "LINE Seed JP Bold",
//           "sans-serif",
//         ],
//       },
//     },
//   },
  plugins: [
    // require("daisyui"),
    // require("tailwind-hamburgers"),
    require("tailwindcss-animate"),
    require("tailwindcss-bg-patterns"),
  ],
};
