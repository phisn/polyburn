module.exports = {
    env: {
        browser: true,
        amd: true,
        node: true,
    },
    parser: "@typescript-eslint/parser",
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
        "turbo",
        "prettier",
    ],
    plugins: ["prettier", "react", "turbo", "@typescript-eslint"],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: true,
    },
    rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/unbound-method": "off",

        eqeqeq: "error",
        "no-var": "error",
    },
    ignorePatterns: ["*.cjs", "vite.config.ts", "rollup.config.mjs"],
}
