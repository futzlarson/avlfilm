import css from "@eslint/css";
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  // Ignore build artifacts and generated files
  {
    ignores: [
      ".astro/",
      ".claude/",
      ".vercel/",
      "node_modules/",
      "dist/",
      "build/",
      "metadata/",
      "**/*.min.js",
    ],
  },

  // JavaScript/TypeScript: ESLint recommended rules
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },

  // TypeScript: typescript-eslint recommended rules
  tseslint.configs.recommended,

  // CSS: CSS linting rules
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
  },

  // Import sorting: Automatically organizes imports into logical groups
  // Groups (in order):
  //   1. Side effect imports (e.g., import './styles.css')
  //   2. Node.js built-in modules (e.g., import fs from 'fs')
  //   3. External packages (e.g., import React from 'react')
  //   4. Internal absolute imports (e.g., import { db } from '@db')
  //   5. Relative parent imports (e.g., import foo from '../foo')
  //   6. Relative sibling imports (e.g., import bar from './bar')
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },

  // Project conventions: Prefer import aliases over relative parent imports
  {
    "rules": {
      "no-restricted-imports": ["error", {
        "patterns": ["../*"]
      }]
    }
  }
]);
