import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js", "**/*.ts"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.browser,
      env: { node: true, es2021: true }
    }
  }
];