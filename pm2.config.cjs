module.exports = {
  apps: [
    {
      script: "index.js",
      watch: ["./lib/*.js", "./index.js"],
      name: "express",
    },
    {
      script: "swc.js",
      watch: ["./swc.js"],
      args: "-i views/js -o views/dist",
      name: "swc",
    },
    {
      script:
        "yarn tailwindcss -i ./views/css/main.css -o ./views/dist/main.css --watch",
      name: "tailwind",
    },
  ],
};
