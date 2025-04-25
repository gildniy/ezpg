/**
 * @type {import("eslint").Linter.Config}
 */
const config = {
  extends: ["./base.js"],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-duplicate-enum-values": "off",
  },
};

module.exports = config;
