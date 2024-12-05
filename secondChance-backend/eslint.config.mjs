import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    // Apply settings to all JavaScript files
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "script", // Use CommonJS script mode
      globals: globals.node, // Use Node.js globals
    },
  },
  {
    // Optionally, add browser-specific configuration for specific files
    files: ["**/browser/**/*.js"], // Example for browser-specific files
    languageOptions: {
      globals: globals.browser,
    },
  },
  pluginJs.configs.recommended,
];
