const { config } = require("@swc/core/spack");
const path = require("path");
module.exports = config({
  entry: {
    index: path.join(__dirname, "views", "js", "index.js"),
    signup: path.join(__dirname, "views", "js", "signup.js"),
    login: path.join(__dirname, "views", "js", "login.js"),
    redirect: path.join(__dirname, "views", "js", "redirect.js"),
  },
  output: {
    path: path.join(__dirname, "views", "dist"),
  },
  module: {},
});
