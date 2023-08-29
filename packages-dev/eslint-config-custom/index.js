module.exports = {
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "turbo",
        "prettier",
    ],
    rules: {
        "react-refresh/only-export-components": "warn",
    },
    parser: "@typescript-eslint/parser",
    plugins: ["prettier", "react", "turbo", "@typescript-eslint"],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
}
