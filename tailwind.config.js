export default {
  content: ["./client/index.html", "./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#1c2430",
        mist: "#eef2f6",
        pine: "#17635a",
        coral: "#d95f43",
        amber: "#e5a13a"
      }
    }
  },
  plugins: []
};
