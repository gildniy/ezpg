// eslint.config.js
const { FlatCompat } = require("@eslint/eslintrc");
const path = require("path");

// Create a compatibility object to use @ezpg/eslint-config/base
const compat = new FlatCompat({
  baseDirectory: path.resolve(__dirname),
});

module.exports = [
  // Include your shared config
  ...compat.config({ extends: ["@ezpg/eslint-config/base"] }),
  {
    files: ["**/*.ts"],
    ignores: ["node_modules/**", "dist/**", "src/generated/**"],
    rules: {
      // Add any specific rules here
    },
  },
];
