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
        "plugin:filenames-simple/recommended-react",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
        "prettier",
        "turbo",
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
        "filenames-simple/named-export": "off",

        eqeqeq: "error",
        "no-var": "error",

        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                "args": "all",
                "argsIgnorePattern": "^_",
                "caughtErrors": "all",
                "caughtErrorsIgnorePattern": "^_",
                "destructuredArrayIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "ignoreRestSiblings": true
            }
        ]
    },
    ignorePatterns: ["*.cjs", "vite.config.ts", "rollup.config.mjs"],
}
