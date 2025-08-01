import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable problematic TypeScript rules
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn", // Change from error to warning

      // Disable React rules that cause build issues
      "react/no-unescaped-entities": "off",

      // Disable Next.js rules that are too strict for development
      "@next/next/no-html-link-for-pages": "warn", // Change from error to warning
      "@next/next/no-img-element": "warn", // Change from error to warning

      // Disable SonarJS rules that are too strict
      "sonarjs/cognitive-complexity": "off",
      "sonarjs/no-nested-template-literals": "off",
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/prefer-immediate-return": "off",

      // Allow console statements for debugging
      "no-console": "off",

      // Allow any for quick development
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",

      // Additional rules to prevent build failures
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/prefer-as-const": "warn",
      
      // React/JSX rules
      "react/jsx-key": "warn",
      "react/display-name": "off",
      "react/prop-types": "off",
      
      // Import rules
      "import/no-unresolved": "off",
      "import/named": "off",
    },
  },
];

export default eslintConfig;
