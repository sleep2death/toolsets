const { config } = require("@swc/core/spack");
const path = require("path");
module.exports = config({
  entry: {
    index: path.join(__dirname, "views", "js", "index.js"),
  },
  output: {
    path: path.join(__dirname, "views", "dist"),
  },
  module: {},
});
