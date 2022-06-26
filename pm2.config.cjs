module.exports = {
  apps: [
    {
      script: "index.js",
      watch: ["./src/*.js", "./index.js"],
      name: "express",
    },
    {
      script: 'yarn spack --config "$PWD/spack.config.cjs"',
      watch: ["./views/js"],
      watch_delay: 500,
      autorestart: false,
      stop_exit_codes: [0],
      name: "swc",
    },
    {
      script:
        "yarn tailwindcss -i ./views/css/main.css -o ./views/dist/main.css --watch",
      name: "tailwind",
    },
  ],
};
