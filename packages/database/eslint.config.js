// eslint.config.js
const { FlatCompat } = require("@eslint/eslintrc");
const path = require("path");

// Create a compatibility object to use @ezpg/eslint-config/library
const compat = new FlatCompat({
  baseDirectory: path.resolve(__dirname),
});

module.exports = [
  // Include your shared config from library
  ...compat.config({ extends: ["@ezpg/eslint-config/library"] }),
  {
    files: ["**/*.ts"],
    ignores: ["node_modules/**", "dist/**", "src/generated/**"],
    rules: {
      // Add any specific rules here
    },
  },
];
