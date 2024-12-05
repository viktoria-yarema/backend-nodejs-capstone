import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"], // Applies to all JS files
    languageOptions: {
      sourceType: "script", // CommonJS mode
      globals: globals.node, // Use Node.js globals
    },
  },
  pluginJs.configs.recommended,
];
