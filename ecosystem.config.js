// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "server",
      script: "server.js",
      watch: true,
      ignore_watch: ["node_modules"],
      env: {
        PORT: process.env.PORT || 200,
      },
    },
  ],
};
