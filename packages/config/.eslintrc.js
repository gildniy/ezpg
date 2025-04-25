module.exports = {
  extends: ["@ezpg/eslint-config/base"],
  parserOptions: {
    project: "./tsconfig.json",
  },
  overrides: [
    {
      files: ["**/*.d.ts"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ],
  ignorePatterns: ["**/*.d.ts", "dist/"],
};
