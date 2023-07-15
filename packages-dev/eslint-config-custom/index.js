module.exports = {
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/jsx-runtime",
        "turbo",
        "prettier",
    ],
    rules: {
        "@next/next/no-html-link-for-pages": "off",
    },
    parser: "@typescript-eslint/parser",
    plugins: ["prettier", "react", "turbo", "@typescript-eslint"],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
}
