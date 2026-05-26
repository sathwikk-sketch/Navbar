/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Segoe UI Variable", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["Cascadia Code", "Cascadia Mono", "Consolas", "monospace"]
      },
      opacity: {
        6: "0.06",
        8: "0.08",
        12: "0.12",
        14: "0.14",
        16: "0.16",
        18: "0.18",
        22: "0.22",
        24: "0.24",
        28: "0.28",
        32: "0.32",
        34: "0.34",
        36: "0.36",
        38: "0.38",
        42: "0.42",
        44: "0.44",
        62: "0.62",
        64: "0.64",
        66: "0.66",
        68: "0.68",
        72: "0.72",
        76: "0.76"
      }
    }
  },
  plugins: []
};
