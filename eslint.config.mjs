import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

function restrictedLayerImports(source, targets) {
  return [
    "error",
    {
      patterns: targets.map((target) => ({
        regex: String.raw`^(?:@/|(?:\.\.?/)+)${target}(?:/|$)`,
        message: `A camada ${source}/ não pode importar ${target}/. Respeite a direção de dependência definida no AGENTS.md.`,
      })),
    },
  ];
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legado em escopo global, não módulo; sai ao fim do porte.
    "js/**",
  ]),
  {
    files: ["lib/**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    rules: {
      "no-restricted-imports": restrictedLayerImports("lib", [
        "app",
        "components",
        "server",
        "db",
      ]),
    },
  },
  {
    files: ["db/**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    rules: {
      "no-restricted-imports": restrictedLayerImports("db", [
        "app",
        "components",
        "server",
      ]),
    },
  },
  {
    files: ["server/**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    rules: {
      "no-restricted-imports": restrictedLayerImports("server", [
        "app",
        "components",
      ]),
    },
  },
  {
    files: [
      "app/**/*.{js,jsx,ts,tsx,mjs,cjs}",
      "components/**/*.{js,jsx,ts,tsx,mjs,cjs}",
    ],
    rules: {
      "no-restricted-imports": restrictedLayerImports("app/components", ["db"]),
    },
  },
  prettierConfig,
]);

export default eslintConfig;
