const isProd = process.env.NODE_ENV === "production";

module.exports = {
  "/api/v1": {
    target: isProd
      ? "https://api.breast-cancer-registry.ng"
      : "http://localhost:3000",
    secure: isProd,
    changeOrigin: false,
    logLevel: "debug",
  },
};
