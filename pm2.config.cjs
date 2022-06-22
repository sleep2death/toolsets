module.exports = {
  apps: [
    {
      script: "index.js",
      watch: ["./src/*.js", "./index.js"],
      name: "express",
    },
    {
      script: "yarn spack --config \"$PWD/spack.config.cjs\"",
      watch: ["./views/js/*.js"],
      name: "swc",
    },
    {
      script:
        "yarn tailwindcss -i ./views/css/main.css -o ./views/dist/main.css --watch",
      name: "tailwind",
    },
  ],
};
